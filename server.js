'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { User } = require('./src/models/User');
const { Order } = require('./src/models/Order');

const app = express();

// Middleware
app.use(express.json());

// MongoDB connection (local or Atlas — set MONGODB_URI in .env)
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecomdb';

const port = process.env.PORT || 3000;

mongoose
  .connect(mongoUri, { autoIndex: true, serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.error('');
    console.error('Fix: set MONGODB_URI in your .env file.');
    console.error('For Atlas: copy .env.example, paste your Atlas connection string, then run: npm run seed');
    process.exit(1);
  });

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid payload' });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase().trim(), passwordHash });
    return res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid payload' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    return res.json({ id: user._id, email: user.email });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Orders API
app.post('/api/orders', async (req, res) => {
  try {
    const { userEmail, items, shipping = 0, tax = 0, status = 'pending', shippingAddress = {} } = req.body;
    if (typeof userEmail !== 'string' || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid payload' });
    }
    const subtotal = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity)), 0);
    const total = subtotal + Number(shipping) + Number(tax);
    const order = await Order.create({ userEmail: userEmail.toLowerCase().trim(), items, subtotal, shipping, tax, total, status, shippingAddress });
    return res.status(201).json({ id: order._id, total: order.total, createdAt: order.createdAt });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const email = String(req.query.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ message: 'email required' });
    const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 }).limit(50);
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Serve static files (your existing website)
const staticDir = path.resolve(__dirname);
app.use(express.static(staticDir));

// Fallback to index.html for root if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});


