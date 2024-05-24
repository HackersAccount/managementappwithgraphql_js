// validators.js
const Joi = require("joi");

// Client validation schema
const clientSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
});

// Project validation schema
const projectSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  status: Joi.string()
    .valid("Not Started", "In Progress", "Completed")
    .required(),
  clientId: Joi.string().required(),
});

const validateClientInput = (input) => clientSchema.validate(input);
const validateProjectInput = (input) => projectSchema.validate(input);

module.exports = { validateClientInput, validateProjectInput };
