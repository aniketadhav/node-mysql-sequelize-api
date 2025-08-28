// src/validators/country.validators.js
const Joi = require("joi");

const createBundleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  isoCode: Joi.string().trim().uppercase().alphanum().max(3).optional(),
  isActive: Joi.boolean().optional(),
  states: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(2).max(120).required(),
        code: Joi.string().trim().max(10).allow("", null),
        isActive: Joi.boolean().optional(),
      })
    )
    .default([]),
});

module.exports = { createBundleSchema };
