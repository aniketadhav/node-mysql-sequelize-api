// src/controllers/web.controller.js
const axios = require("axios");
const Groq = require("groq-sdk");
const { success, error } = require("../utils/response");
const {
  searchSchema,
  answerWithWebSchema,
} = require("../validators/web.validators");
const { searchOpenApi } = require("../services/openSearch");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ---- Provider adapters -------------------------------------------------

async function searchSerpApi({ query, num, site }) {
  if (!process.env.SERPAPI_KEY) {
    throw new Error("SERPAPI_KEY is not configured on the server");
  }
  const params = new URLSearchParams({
    engine: "google",
    q: site ? `site:${site} ${query}` : query,
    num: String(num),
    api_key: process.env.SERPAPI_KEY,
  });

  const url = `https://serpapi.com/search.json?${params.toString()}`;
  const { data } = await axios.get(url, { timeout: 12_000 });

  // Normalize: pick organic_results
  const items = (data.organic_results || []).slice(0, num).map((r) => ({
    title: r.title,
    link: r.link,
    snippet: r.snippet,
  }));
  return items;
}

async function searchBing({ query, num, site }) {
  if (!process.env.BING_SEARCH_KEY) {
    throw new Error("BING_SEARCH_KEY is not configured on the server");
  }
  const endpoint =
    process.env.BING_SEARCH_ENDPOINT ||
    "https://api.bing.microsoft.com/v7.0/search";
  const q = site ? `site:${site} ${query}` : query;

  const { data } = await axios.get(endpoint, {
    params: { q, count: num, textDecorations: false, textFormat: "Raw" },
    headers: { "Ocp-Apim-Subscription-Key": process.env.BING_SEARCH_KEY },
    timeout: 12_000,
  });

  const webPages = data.webPages?.value || [];
  const items = webPages.slice(0, num).map((r) => ({
    title: r.name,
    link: r.url,
    snippet: r.snippet,
  }));
  return items;
}

// ---- Endpoints ---------------------------------------------------------

// POST /api/web/search
exports.search = async (req, res, next) => {
  try {
    const { value, error: valErr } = searchSchema.validate(req.body);
    if (valErr) return error(res, valErr.message, 400);

    const items = await runSearch(value);
    return success(res, {
      results: items,
      query: value.query,
      provider: value.provider,
    });
  } catch (e) {
    if (axios.isAxiosError?.(e)) {
      return error(
        res,
        `Search provider error: ${e.response?.status || ""} ${e.message}`,
        502
      );
    }
    next(e);
  }
};

// POST /api/ai/answer-with-web
// 1) search web | With (runSearch) or Without (runOpenSearch) API Key, 2) feed top snippets to Groq 3) return grounded answer + cites
exports.answerWithWeb = async (req, res, next) => {
  try {
    const { value, error: valErr } = answerWithWebSchema.validate(req.body);
    if (valErr) return error(res, valErr.message, 400);
    const { prompt, query, num, provider, model, temperature, maxTokens } =
      value;

    if (!process.env.GROQ_API_KEY) {
      return error(res, "GROQ_API_KEY is not configured on the server", 500);
    }

    // 1) Search
    const results = await runOpenSearch({ query, num, provider });

    // 2) Build short context (cap tokens/chars)
    const contextBlocks = results
      .map(
        (r, i) =>
          `[#${i + 1}] ${r.title}\nURL: ${r.link}\nSnippet: ${r.snippet}`
      )
      .join("\n\n");

    const system = [
      "You are a helpful assistant. Use the provided web snippets as context.",
      "If the context is insufficient, say what is missing instead of inventing facts.",
      "Cite sources inline like [#1], [#2] that correspond to the provided list.",
    ].join(" ");

    const messages = [
      { role: "system", content: system },
      {
        role: "user",
        content: `Question: ${prompt}

Context:
${contextBlocks}

Write a concise answer (bulleted if helpful). Include source markers [#n] next to claims derived from the context.`,
      },
    ];

    // 3) Ask Groq (non-streaming)
    const resp = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const text = resp?.choices?.[0]?.message?.content || "";

    return success(res, {
      answer: text,
      sources: results.map((r, i) => ({
        id: `#${i + 1}`,
        title: r.title,
        link: r.link,
      })),
    });
  } catch (e) {
    if (axios.isAxiosError?.(e)) {
      return error(
        res,
        `Search provider error: ${e.response?.status || ""} ${e.message}`,
        502
      );
    }
    // Groq or other errors
    if (e?.response?.status) {
      return error(res, `Groq error ${e.response.status}: ${e.message}`, 502);
    }
    next(e);
  }
};

async function runOpenSearch(opts) {
  return searchOpenApi(opts); // always open DuckDuckGo
}

async function runSearch(opts) {
  if (opts.provider === "bing") return searchBing(opts);
  return searchSerpApi(opts); // default
}
