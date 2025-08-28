// src/validators/web.validators.js
const Joi = require("joi");

const searchSchema = Joi.object({
  query: Joi.string().trim().min(2).max(300).required(),
  num: Joi.number().integer().min(1).max(10).default(5), // top results
  // optional: site/domain restriction, locale, etc.
  site: Joi.string().trim().max(100).optional(),
  // choose provider (default serpapi). Later you can add 'bing'
  provider: Joi.string().valid("serpapi", "bing").default("serpapi"),
});

const answerWithWebSchema = Joi.object({
  prompt: Joi.string().trim().min(5).max(2000).required(),
  query: Joi.string().trim().min(2).max(300).required(),
  num: Joi.number().integer().min(1).max(8).default(5),
  provider: Joi.string().valid("serpapi", "bing").default("serpapi"),
  model: Joi.string().trim().default("llama-3.1-8b-instant"),
  temperature: Joi.number().min(0).max(2).default(0.3),
  maxTokens: Joi.number().min(64).max(1024).default(512),
});

module.exports = { searchSchema, answerWithWebSchema };
