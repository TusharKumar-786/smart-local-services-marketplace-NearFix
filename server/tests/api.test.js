process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { initializeEngine } from '../src/server.js';
import { User } from '../src/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nearfix';

test('Integration Test: Database connection, engine initialization and demo users', async () => {
  await mongoose.connect(MONGODB_URI);
  assert.equal(mongoose.connection.readyState, 1);

  const pipeline = await initializeEngine();
  assert.ok(pipeline);

  // Search through pipeline directly
  const searchResults = pipeline.search({
    serviceCategory: 'plumber',
    customerArea: 'Phase 7, Mohali',
    urgency: 'normal',
  });

  assert.ok(searchResults.providers.length > 0, 'Expected providers to be returned');
  assert.ok(searchResults.providers[0].matchPercentage >= 50, 'Match percentage must be valid');
  assert.ok(searchResults.providers[0].distanceKm >= 0, 'Distance must be non-negative');

  // Verify demo users exist
  const demoCustomer = await User.findOne({ email: 'arjun.customer@nearfix.in' });
  assert.ok(demoCustomer, 'Demo customer must exist');
  assert.equal(demoCustomer.role, 'customer');

  const demoProvider = await User.findOne({ email: 'rajesh.electric@nearfix.in' });
  assert.ok(demoProvider, 'Demo provider must exist');
  assert.equal(demoProvider.role, 'provider');

  const demoAdmin = await User.findOne({ email: 'admin@nearfix.in' });
  assert.ok(demoAdmin, 'Demo admin must exist');
  assert.equal(demoAdmin.role, 'admin');

  await mongoose.disconnect();
});
