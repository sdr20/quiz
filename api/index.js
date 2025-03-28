const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String, // In production, hash this with bcrypt
  role: String, // 'teacher' or 'student'
});

const User = mongoose.model('User', userSchema);

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: String,
  subject: String,
  pointsPerQuestion: Number,
  questions: [
    {
      questionText: String,
      options: [
        {
          text: String,
          isCorrect: Boolean,
        },
      ],
    },
  ],
  createdBy: String,
});

const Quiz = mongoose.model('Quiz', quizSchema);

// Quiz Result Schema
const quizResultSchema = new mongoose.Schema({
  quizId: String,
  studentId: String,
  score: Number,
  total: Number,
  answers: [
    {
      questionId: Number,
      selectedOption: String,
      isCorrect: Boolean,
    },
  ],
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

// API Routes
// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.findOne({ username, password, role });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Create a User (for testing; in production, use a proper signup flow)
app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Get Quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching quizzes' });
  }
});

// Create a Quiz
app.post('/api/quizzes', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Error creating quiz' });
  }
});

// Submit Quiz Results
app.post('/api/submit-quiz', async (req, res) => {
  try {
    const result = new QuizResult(req.body);
    await result.save();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error submitting quiz' });
  }
});

// Get Quiz Results for a Student
app.get('/api/results/:studentId', async (req, res) => {
  try {
    const results = await QuizResult.find({ studentId: req.params.studentId });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching results' });
  }
});

module.exports = app;