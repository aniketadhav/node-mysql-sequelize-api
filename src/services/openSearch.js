// src/services/openSearch.js
const axios = require("axios");

async function searchOpenApi({ query, num = 5, site }) {
  // DuckDuckGo API (free, no key)
  const q = site ? `site:${site} ${query}` : query;

  const url = "https://api.duckduckgo.com/";
  const { data } = await axios.get(url, {
    params: {
      q,
      format: "json",
      no_html: 1,
      no_redirect: 1,
    },
    timeout: 12_000,
  });

  // Normalize results
  const results = [];

  // 1) Abstract (if available)
  if (data.AbstractText) {
    results.push({
      title: data.Heading || "DuckDuckGo Abstract",
      link: data.AbstractURL,
      snippet: data.AbstractText,
    });
  }

  // 2) RelatedTopics (array of objects with Text + FirstURL)
  if (Array.isArray(data.RelatedTopics)) {
    for (const t of data.RelatedTopics) {
      if (t.Text && t.FirstURL) {
        results.push({
          title: t.Text.slice(0, 60) + "...",
          link: t.FirstURL,
          snippet: t.Text,
        });
      }
    }
  }

  return results.slice(0, num);
}

module.exports = { searchOpenApi };
