'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../src/models/User');

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecomdb';
  await mongoose.connect(mongoUri, { autoIndex: true });
  try {
    const email = process.env.SEED_EMAIL || 'test@example.com';
    const password = process.env.SEED_PASSWORD || 'password123';
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.log('User already exists:', existing.email);
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ email: email.toLowerCase().trim(), passwordHash });
      console.log('Seeded user:', user.email);
      console.log('Password:', password);
    }
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();


