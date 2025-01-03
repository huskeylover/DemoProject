const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/todo-app', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});
const User = mongoose.model('User', UserSchema);

// To-Do Schema
const TodoSchema = new mongoose.Schema({
    user_id: String,
    task: String,
    completed: Boolean,
});
const Todo = mongoose.model('Todo', TodoSchema);

// Register Route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});

// Protected Route: Get To-Dos
app.get('/todos', async (req, res) => {
    const token = req.headers['authorization'];
    console.log('Token Received:', token); // log the token
    if (!token) {
        return res.status(401).send('Unathorized: No token provided');
    }
    try {
        const decoded = jwt.verify(tokent.replace('Bearer ', ''), 'secret_key'); // Remove Bearer prefix
        console.log('Decoded token:', decoded);
        const todos = await Todo.find({ user_id: decoded.userId });
        res.json(todos);
    } catch (err) {
        console.error('Error fetching to-dos:', err);
        res.status(401).send('Unathorized: Invalid token');
    }
});

// Protected Route: Add To-Do
app.post('/todos', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send('Unathorized: No token provided');
    }
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), 'secret_key');
        const { task } = req.body;
        const todo = new Todo({ user_id: decoded.userId, task, completed: false });
        await todo.save();
        res.status(201).json(todo); // return new to-do
    } catch (err) {
        console.error('Error adding to-do', err);
        res.status(500).send('Error adding to-do')
    }
});

// Start Server
app.listen (3000, () => console.log('Server running on http://localhost:3000'));