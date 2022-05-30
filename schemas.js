const Joi = require('joi');
module.exports.recipeSchema = Joi.object({
    recipe: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required()
    }).required()
})