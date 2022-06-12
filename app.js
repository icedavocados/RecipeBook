const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { recipeSchema, reviewSchema } = require('./schemas');
const Recipe = require('./modules/recipe');
const Review = require('./modules/comment');
const User = require('./modules/user');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/RecipeBook', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error: "));
db.once('open', () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 5,
        maxAge: 1000 * 60 * 5
    }
}

app.use(session(sessionConfig));

const validateRecipe = (req, res, next) => {
    const { error } = recipeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', catchAsync(async(req, res) => {
    const recipes = await Recipe.find({});
    res.render('home.ejs', { recipes });
}))

app.get('/recipes', catchAsync(async(req, res) => {
    const recipes = await Recipe.find({});
    res.render('recipes.ejs', { recipes });
}))

app.post('/recipes', validateRecipe, catchAsync(async(req, res) => {
    const recipe = new Recipe(req.body.recipe);
    await recipe.save();
    res.redirect('/recipes')
}))

app.get('/recipes/new', (req, res) => {
    res.render('new.ejs');
})

app.get('/recipes/:id', catchAsync(async(req, res) => {
    const recipe = await Recipe.findById(req.params.id).populate('comments');
    res.render('show.ejs', { recipe })
}))

app.delete('/recipes/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    await Recipe.findByIdAndDelete(id);
    res.redirect('/recipes');
}))

app.post('/recipes/:id/review', validateReview, catchAsync(async(req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    const review = new Review(req.body.review);
    recipe.comments.push(review);
    await review.save();
    await recipe.save();
    res.redirect(`/recipes/${recipe._id}`);
}))

app.delete('/recipes/:id/reviews/:commentId', catchAsync(async(req, res) => {
    const { id, commentId } = req.params;
    await Recipe.findByIdAndUpdate(id, { $pull: { comment: commentId } });
    await Review.findByIdAndDelete(commentId);
    res.redirect(`/recipes/${id}`);
}))

app.get('/calculator', (req, res) => {
    res.send('Under development');
})

app.get('/accounts', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('/accounts/noAccount')
    } else {
        res.redirect(`/accounts/${req.session.user_id}`)
    }
})

app.get('/accounts/noAccount', (req, res) => {
    res.render('loginORregister.ejs');
})

app.get('/accounts/register', (req, res) => {
    res.render('register.ejs');
})

app.post('/accounts/register', catchAsync(async(req, res) => {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username,
        email,
        password: hash
    });
    await user.save();
    req.session.user_id = user._id;
    res.redirect(`/accounts/${user._id}`);
}))

app.get('/accounts/login', (req, res) => {
    res.render('login.ejs');
})

app.post('/accounts/login', catchAsync(async(req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findOne({ username });
    const valid = await bcrypt.compare(password, foundUser.password);
    if (valid) {
        req.session.user_id = foundUser._id;
        res.redirect(`/accounts/${foundUser._id}`);
    } else {
        res.redirect('login.ejs');
    }
}))

app.get('/accounts/:id', (req, res) => {
    res.render('account.ejs')
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/')
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})
