process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { initializeEngine } from '../src/server.js';
import { User } from '../src/models/User.js';
import { ProviderProfile } from '../src/models/ProviderProfile.js';
import { Booking } from '../src/models/Booking.js';
import { Payment } from '../src/models/Payment.js';
import { Review } from '../src/models/Review.js';

import { register } from '../src/controllers/authController.js';
import { searchProviders } from '../src/controllers/providerController.js';
import { createBooking, updateBookingStatus } from '../src/controllers/bookingController.js';
import { processPayment } from '../src/controllers/paymentController.js';
import { createReview } from '../src/controllers/reviewController.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nearfix';

// Helper to mock Express req & res
function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

test('1. Database connection, engine initialization and demo accounts', async () => {
  await mongoose.connect(MONGODB_URI);
  assert.equal(mongoose.connection.readyState, 1);

  const pipeline = await initializeEngine();
  assert.ok(pipeline);

  const demoCustomer = await User.findOne({ email: 'arjun.customer@nearfix.in' });
  assert.ok(demoCustomer);
  assert.equal(demoCustomer.role, 'customer');

  const demoProvider = await User.findOne({ email: 'rajesh.electric@nearfix.in' });
  assert.ok(demoProvider);
  assert.equal(demoProvider.role, 'provider');

  const demoAdmin = await User.findOne({ email: 'admin@nearfix.in' });
  assert.ok(demoAdmin);
  assert.equal(demoAdmin.role, 'admin');
});

test('2. Auth fix: Registration rejects admin role with 400', async () => {
  const req = {
    body: {
      name: 'Fake Admin',
      email: `fake.admin.${Date.now()}@nearfix.in`,
      phone: '9876543210',
      password: 'SecretPassword123!',
      role: 'admin',
    },
  };
  const res = mockRes();

  await register(req, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /admin/i);
});

test('3. Search fix: Unknown service slug and unknown area return 400', async () => {
  // Test unknown service slug
  const reqUnknownService = {
    query: { service: 'rocket-repair' },
  };
  const res1 = mockRes();
  await searchProviders(reqUnknownService, res1);
  assert.equal(res1.statusCode, 400);
  assert.match(res1.body.message, /Unknown service category/i);

  // Test unknown area name
  const reqUnknownArea = {
    query: { service: 'plumber', area: 'Narnia Wonderland' },
  };
  const res2 = mockRes();
  await searchProviders(reqUnknownArea, res2);
  assert.equal(res2.statusCode, 400);
  assert.match(res2.body.message, /Unknown neighbourhood/i);
});

test('4. Booking fix: createBooking validates body with Zod and computes price on server', async () => {
  const customer = await User.findOne({ email: 'arjun.customer@nearfix.in' });
  const provider = await ProviderProfile.findOne();

  // Test past date failure
  const pastReq = {
    user: customer,
    body: {
      providerId: String(provider._id),
      category: 'plumber',
      address: 'House #123, Phase 7',
      problemDescription: 'Leaking pipe',
      scheduledFor: new Date(Date.now() - 3600000).toISOString(),
    },
  };
  const resPast = mockRes();
  await createBooking(pastReq, resPast);
  assert.equal(resPast.statusCode, 400);
  assert.match(resPast.body.message, /future/i);

  // Test successful booking creation with ignored client price
  const futureDate = new Date(Date.now() + 86400000).toISOString();
  const validReq = {
    user: customer,
    body: {
      providerId: String(provider._id),
      category: 'plumber',
      address: 'House #123, Phase 7',
      problemDescription: 'Leaking pipe under kitchen sink',
      scheduledFor: futureDate,
      price: 10, // Client tries to send ₹10, server must ignore!
    },
  };
  const resValid = mockRes();
  await createBooking(validReq, resValid);
  assert.equal(resValid.statusCode, 201);
  assert.ok(resValid.body.booking);
  assert.equal(resValid.body.booking.price, provider.pricing?.visitCharge || 350);
});

test('5. Booking state machine & authorization checks', async () => {
  const customer = await User.findOne({ email: 'arjun.customer@nearfix.in' });
  const provider = await ProviderProfile.findOne({}).populate('user');
  const otherUser = await User.findOne({ role: 'customer', _id: { $ne: customer._id } });

  // Create fresh booking in 'requested' state
  const booking = await Booking.create({
    customer: customer._id,
    provider: provider._id,
    category: 'plumber',
    serviceName: 'Plumber Service',
    address: 'House #10, Sector 17',
    neighbourhood: 'Sector 17, Chandigarh',
    scheduledFor: new Date(Date.now() + 86400000),
    problemDescription: 'State machine test',
    price: 350,
    status: 'requested',
    paymentStatus: 'pending',
  });

  // Unauthorized user gets 403
  const resUnauth = mockRes();
  await updateBookingStatus({ user: otherUser, params: { id: String(booking._id) }, body: { status: 'cancelled' } }, resUnauth);
  assert.equal(resUnauth.statusCode, 403);

  // Customer cannot transition to in_progress or completed (only cancelled)
  const resCustInvalid = mockRes();
  await updateBookingStatus({ user: customer, params: { id: String(booking._id) }, body: { status: 'in_progress' } }, resCustInvalid);
  assert.equal(resCustInvalid.statusCode, 403);

  // Provider cannot jump directly from requested to completed
  const resProvJump = mockRes();
  await updateBookingStatus({ user: provider.user, params: { id: String(booking._id) }, body: { status: 'completed' } }, resProvJump);
  assert.equal(resProvJump.statusCode, 400);

  // Provider accepts: requested -> accepted
  const resAccept = mockRes();
  await updateBookingStatus({ user: provider.user, params: { id: String(booking._id) }, body: { status: 'accepted' } }, resAccept);
  assert.equal(resAccept.statusCode, 200);

  // Provider starts work: accepted -> in_progress
  const resProgress = mockRes();
  await updateBookingStatus({ user: provider.user, params: { id: String(booking._id) }, body: { status: 'in_progress' } }, resProgress);
  assert.equal(resProgress.statusCode, 200);

  // Provider completes work: in_progress -> completed
  const prevEarnings = (await ProviderProfile.findById(provider._id)).earningsTotal;
  const resComplete = mockRes();
  await updateBookingStatus({ user: provider.user, params: { id: String(booking._id) }, body: { status: 'completed' } }, resComplete);
  assert.equal(resComplete.statusCode, 200);

  const updatedEarnings = (await ProviderProfile.findById(provider._id)).earningsTotal;
  assert.equal(updatedEarnings, prevEarnings + booking.price);

  // Completed is terminal: customer cannot transition a completed booking
  const resTerminal = mockRes();
  await updateBookingStatus({ user: customer, params: { id: String(booking._id) }, body: { status: 'cancelled' } }, resTerminal);
  assert.equal(resTerminal.statusCode, 400);
  assert.match(resTerminal.body.message, /Invalid status transition/i);

  // Completed is terminal: provider cannot transition a completed booking
  const resProvTerminal = mockRes();
  await updateBookingStatus({ user: provider.user, params: { id: String(booking._id) }, body: { status: 'in_progress' } }, resProvTerminal);
  assert.equal(resProvTerminal.statusCode, 400);
});

test('6. Payment fix: allows only accepted/completed bookings and prevents duplicate payment', async () => {
  const customer = await User.findOne({ email: 'arjun.customer@nearfix.in' });
  const provider = await ProviderProfile.findOne();

  // Booking in 'requested' status cannot be paid yet
  const requestedBooking = await Booking.create({
    customer: customer._id,
    provider: provider._id,
    category: 'electrician',
    serviceName: 'Electrician Service',
    address: 'Sector 22, Chandigarh',
    neighbourhood: 'Sector 22, Chandigarh',
    scheduledFor: new Date(Date.now() + 86400000),
    problemDescription: 'Payment state test',
    price: 350,
    status: 'requested',
    paymentStatus: 'pending',
  });

  const resReq = mockRes();
  await processPayment({ user: customer, body: { bookingId: String(requestedBooking._id), amount: 10 } }, resReq);
  assert.equal(resReq.statusCode, 400);
  assert.match(resReq.body.message, /accepted or completed/i);

  // Now change booking to 'accepted'
  requestedBooking.status = 'accepted';
  await requestedBooking.save();

  // Payment succeeds and uses booking.price ignoring amount: 10
  const resPay = mockRes();
  await processPayment({ user: customer, body: { bookingId: String(requestedBooking._id), amount: 10 } }, resPay);
  assert.equal(resPay.statusCode, 201);
  assert.equal(resPay.body.payment.amount, 350);

  // Duplicate payment fails
  const resDup = mockRes();
  await processPayment({ user: customer, body: { bookingId: String(requestedBooking._id) } }, resDup);
  assert.equal(resDup.statusCode, 400);
  assert.match(resDup.body.message, /already exists/i);
});

test('7. Review fix: validates rating as an integer from 1 to 5', async () => {
  const customer = await User.findOne({ email: 'arjun.customer@nearfix.in' });
  const provider = await ProviderProfile.findOne();

  const completedBooking = await Booking.create({
    customer: customer._id,
    provider: provider._id,
    category: 'electrician',
    serviceName: 'Electrician Service',
    address: 'Sector 35, Chandigarh',
    neighbourhood: 'Sector 35, Chandigarh',
    scheduledFor: new Date(Date.now() - 86400000),
    problemDescription: 'Review test',
    price: 350,
    status: 'completed',
    paymentStatus: 'paid',
  });

  // Test float rating (e.g. 4.5) -> should be rejected
  const resFloat = mockRes();
  await createReview({ user: customer, body: { bookingId: String(completedBooking._id), rating: 4.5, comment: 'Good' } }, resFloat);
  assert.equal(resFloat.statusCode, 400);
  assert.match(resFloat.body.message, /integer/i);

  // Test rating out of bounds (e.g. 6)
  const resOOB = mockRes();
  await createReview({ user: customer, body: { bookingId: String(completedBooking._id), rating: 6, comment: 'Good' } }, resOOB);
  assert.equal(resOOB.statusCode, 400);

  // Test valid rating
  const resValid = mockRes();
  await createReview({ user: customer, body: { bookingId: String(completedBooking._id), rating: 5, comment: 'Excellent work!' } }, resValid);
  assert.equal(resValid.statusCode, 201);

  await mongoose.disconnect();
});
