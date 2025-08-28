// src/validators/ai.validators.js
const Joi = require("joi");

const completionSchema = Joi.object({
  // user prompt (required)
  prompt: Joi.string().trim().min(1).max(4000).required(),

  // optional settings with sane defaults
  model: Joi.string().trim().default("llama-3.1-8b-instant"), // fast, cheap; adjust as needed
  temperature: Joi.number().min(0).max(2).default(0.7),
  maxTokens: Joi.number().min(1).max(2048).default(512),

  // optional system instruction
  system: Joi.string().trim().max(2000).optional(),

  // optional: return raw provider response
  raw: Joi.boolean().default(false),
});

module.exports = { completionSchema };
