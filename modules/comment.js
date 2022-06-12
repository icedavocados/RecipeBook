const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    rating: Number,
    body: String
})

module.exports = mongoose.model('Comment', commentSchema);