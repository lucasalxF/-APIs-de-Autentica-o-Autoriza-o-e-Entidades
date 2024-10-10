const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const Post = require('./models/Post');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/myapi', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.use('/auth', authRoutes);

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).send('Access denied');

    try {
        const verified = jwt.verify(token, 'secret');
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
};

app.post('/posts', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const post = new Post({ title, content, author: req.user.id });
    try {
        await post.save();
        res.status(201).send('Post created');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
