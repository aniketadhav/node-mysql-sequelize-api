// src/controllers/ai.controller.js
const Groq = require("groq-sdk"); // CommonJS import
const { success, error } = require("../utils/response");
const { completionSchema } = require("../validators/ai.validators");



const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/ai/complete  (non-streaming)
exports.complete = async (req, res, next) => {
  try {
    // 1) validate inputs
    const { value, error: valErr } = completionSchema.validate(req.body);
    if (valErr) return error(res, valErr.message, 400);
    const { prompt, model, temperature, maxTokens, system, raw } = value;

    if (!process.env.GROQ_API_KEY) {
      return error(res, "GROQ_API_KEY is not configured on the server", 500);
    }

    // 2) build messages
    const messages = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    // 3) call Groq
    const resp = await groq.chat.completions.create({
      model, // e.g., 'llama-3.1-8b-instant' or 'llama-3.1-70b-versatile'
      messages,
      temperature,
      max_tokens: maxTokens, // note: SDK uses snake_case for OpenAI compat
    });

    // 4) normalize output
    const text = resp?.choices?.[0]?.message?.content || "";

    // 5) optionally return raw for debugging
    if (raw) return success(res, { text, raw: resp });

    return success(res, { text });
  } catch (e) {
    // handle common provider errors more clearly
    if (e?.response?.status) {
      return error(res, `Groq error ${e.response.status}: ${e.message}`, 502);
    }
    next(e);
  }
};

// POST /api/ai/complete-stream  (server-sent events style stream)
exports.completeStream = async (req, res, next) => {
  try {
    const { value, error: valErr } = completionSchema.validate(req.body);
    if (valErr) return error(res, valErr.message, 400);
    const { prompt, model, temperature, maxTokens, system } = value;

    if (!process.env.GROQ_API_KEY) {
      return error(res, "GROQ_API_KEY is not configured on the server", 500);
    }

    const messages = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    // Set up Server-Sent Events headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    // Start the stream
    const stream = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }

    // Signal end
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (e) {
    // when streaming, we should write an error as an event if possible
    try {
      res.write(
        `data: ${JSON.stringify({ error: e.message || "stream error" })}\n\n`
      );
      res.end();
    } catch (_) {}
    // also pass to error middleware for logs
    next(e);
  }
};
