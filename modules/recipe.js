const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    title: String,
    description: String
})

module.exports = mongoose.model('Recipe', recipeSchema);