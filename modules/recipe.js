const mongoose = require('mongoose');
const Comment = require('./comment');
const User = require('./user');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    title: String,
    image: String,
    author: String,
    description: String,
    steps: String,
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
});

recipeSchema.post('findOneandDelete', async function(doc) {
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})

module.exports = mongoose.model('Recipe', recipeSchema);
