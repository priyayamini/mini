const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const redis = require('redis');
const path = require('path');
const validator = require('validator');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

// Redis Client
const redisClient = redis.createClient();

// MongoDB Connection
mongoose.connect('mongodb+srv://yaminipriya123:Happy12345@cluster0.enyj1ig.mongodb.net/tasks', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Storage for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// User Registration
app.post('/api/user/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();
  res.status(201).json({ success: true, message: 'User registered' });
});

// User Login
app.post('/api/user/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, "random#secret", { expiresIn: '1h' });
  res.json({ success: true, token });
});

// Image Upload
app.post('/api/upload', upload.single('image'), async (req, res) => {
  const filePath = req.file.path;
  await sharp(filePath)
    .resize(800, 600)
    .toFile(filePath.replace(/(\.\w+)$/, '-optimized$1'));

  res.json({ success: true, file: req.file });
});

// Get User Profile
app.get('/api/user/profile', async (req, res) => {
  // Assuming req.user.id is set by a middleware for authentication
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
});

// Update User Profile
app.put('/api/user/profile', async (req, res) => {
  const { name, bio } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name, bio }, { new: true });
  res.json({ success: true, user });
});

// Task Management
app.post('/api/task', async (req, res) => {
  const { title, description } = req.body;
  const task = new Task({ title, description });
  await task.save();
  res.status(201).json({ success: true, task });
});

app.put('/api/task/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, task });
});

app.delete('/api/task/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json({ success: true, tasks });
});

// Caching Middleware
app.use((req, res, next) => {
  redisClient.get(req.originalUrl, (err, data) => {
    if (err) throw err;
    if (data) {
      res.send(JSON.parse(data));
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        redisClient.setex(req.originalUrl, 3600, JSON.stringify(body));
        res.sendResponse(body);
      };
      next();
    }
  });
});

app.listen(4000, () => console.log('Server running on port 4000'));
