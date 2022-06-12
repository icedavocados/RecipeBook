const mongoose = require('mongoose');
const { meats, cooks } = require('./helper');
const Recipe = require('../modules/recipe');

mongoose.connect('mongodb://localhost:27017/RecipeBook', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error: "));
db.once('open', () => {
    console.log("Database connected");
});

const randomArray = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    for (let i = 0; i < 50; i++) {
        const newRecipe = new Recipe({
            title: `${randomArray(cooks)} ${randomArray(meats)}`,
            image: 'https://source.unsplash.com/collection/1424340',
            author: 'Super Admin',
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repellat, quo nam, alias excepturi perferendis ipsa ex sapiente magni consectetur blanditiis itaque officiis voluptate vero esse dolor, animi mollitia architecto earum?',
            steps: '1. First\n2. Second\n 3. Third'
        })
        await newRecipe.save();
    }
}

seedDB().then(() => {
    console.log('Seed finished');
    mongoose.connection.close();
})
