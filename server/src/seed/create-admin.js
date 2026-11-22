/**
 * create-admin.js — Provisions a single admin account.
 * Run: npm run create-admin
 * Reads ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME from env (or falls back to prompts via argv).
 * Never invokable via public API.
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import { User } from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nearfix';

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); });
  });
}

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const name     = process.env.ADMIN_NAME     || await ask('Admin display name: ');
    const email    = process.env.ADMIN_EMAIL    || await ask('Admin email: ');
    const password = process.env.ADMIN_PASSWORD || await ask('Admin password (min 10 chars): ');

    if (!email || !password || password.length < 10) {
      console.error('Email and a password of at least 10 characters are required.');
      process.exit(1);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.error(`An account with email ${email} already exists (role: ${existing.role}).`);
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    await User.create({
      name: name || 'Platform Admin',
      email,
      phone: '0000000000',
      passwordHash,
      role: 'admin',
      status: 'active',
      neighbourhood: 'Sector 17, Chandigarh',
    });

    console.log(`\n✓ Admin account created successfully.`);
    console.log(`  Email: ${email}`);
    console.log(`  Sign in via the private admin URL.`);
    process.exit(0);
  } catch (err) {
    console.error('create-admin failed:', err.message);
    process.exit(1);
  }
}

createAdmin();
