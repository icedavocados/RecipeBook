const Joi = require('joi');
module.exports.recipeSchema = Joi.object({
    recipe: Joi.object({
        title: Joi.string().required(),
        image: Joi.string().required(),
        author: Joi.string().required(),
        description: Joi.string().required()
    }).required()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number(),
        body: Joi.string().required()
    }).required()
})

module.exports.userSchema = Joi.object({
    user: Joi.object({
        username: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required()
    }).required()
})
