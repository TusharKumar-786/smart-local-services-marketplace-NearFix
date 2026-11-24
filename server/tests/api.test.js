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

import { register, login } from '../src/controllers/authController.js';
import { searchProviders } from '../src/controllers/providerController.js';
import { createBooking, updateBookingStatus } from '../src/controllers/bookingController.js';
import { processPayment } from '../src/controllers/paymentController.js';
import { createReview } from '../src/controllers/reviewController.js';
import {
  toggleBlockUser,
  updateProviderVerification,
  listAdminBookings,
  listAllProviders,
  getAnalyticsSummary,
} from '../src/controllers/adminController.js';
import { createApp } from '../src/app.js';
import jwt from 'jsonwebtoken';

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

test('2. Auth fix: Registration rejects admin role with 400, admin logs in with role admin, blocked users rejected', async () => {
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

  // Admin logs in and receives role 'admin'
  const adminReq = {
    body: {
      email: 'admin@nearfix.in',
      password: 'AdminPass123!',
    },
  };
  const adminRes = mockRes();
  await login(adminReq, adminRes);
  assert.equal(adminRes.statusCode, 200);
  assert.equal(adminRes.body.user.role, 'admin');

  // Blocked user cannot log in (returns 403)
  const blockedUser = await User.create({
    name: 'Suspended Account',
    email: `blocked.${Date.now()}@nearfix.in`,
    phone: '9876543200',
    passwordHash: adminRes.body.token,
    role: 'customer',
    status: 'blocked',
  });
  const blockedReq = {
    body: {
      email: blockedUser.email,
      password: 'AnyPassword123!',
    },
  };
  const blockedRes = mockRes();
  await login(blockedReq, blockedRes);
  assert.equal(blockedRes.statusCode, 403);
  assert.match(blockedRes.body.message, /suspended/i);
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
});

test('8. Admin panel RBAC, self-block protection, and verification validation', async () => {
  const demoCustomer = await User.findOne({ email: 'arjun.customer@nearfix.in' });
  const demoAdmin = await User.findOne({ email: 'admin@nearfix.in' });
  const provider = await ProviderProfile.findOne().populate('user');
  assert.ok(demoCustomer);
  assert.ok(demoAdmin);
  assert.ok(provider);

  // Spin up ephemeral server to test real HTTP middleware and routing
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const secret = process.env.JWT_SECRET || 'nearfix_super_secure_jwt_secret_key_2026';
  const customerToken = jwt.sign({ id: demoCustomer._id }, secret);
  const adminToken = jwt.sign({ id: demoAdmin._id }, secret);

  try {
    // 1. Non-admin customer receives 403 on every /api/admin/* route
    const adminEndpoints = [
      '/api/admin/analytics',
      '/api/admin/bookings',
      '/api/admin/payments',
      '/api/admin/providers',
      '/api/admin/activity',
      '/api/admin/users',
      '/api/admin/complaints',
    ];

    for (const endpoint of adminEndpoints) {
      const resp = await fetch(`${baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      assert.equal(
        resp.status,
        403,
        `Expected 403 Forbidden for customer on ${endpoint}, got ${resp.status}`
      );
    }

    // 2. Admin receives 200 on /api/admin/analytics
    const adminResp = await fetch(`${baseUrl}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminResp.status, 200);
    const analyticsData = await adminResp.json();
    assert.ok(analyticsData.metrics);
    assert.ok(Array.isArray(analyticsData.bookingsByStatus));
    assert.ok(Array.isArray(analyticsData.revenueByMethod));

    // 3. Admin cannot block their own account (returns 400)
    const resBlockSelf = mockRes();
    await toggleBlockUser(
      { user: demoAdmin, params: { userId: String(demoAdmin._id) } },
      resBlockSelf
    );
    assert.equal(resBlockSelf.statusCode, 400);
    assert.match(resBlockSelf.body.message, /Cannot block your own administrator account/i);

    // 4. Admin cannot block another admin (returns 400)
    const otherAdmin = await User.create({
      name: 'Second Admin',
      email: `second.admin.${Date.now()}@nearfix.in`,
      phone: '9888888888',
      passwordHash: 'hash',
      role: 'admin',
    });
    const resBlockAdmin = mockRes();
    await toggleBlockUser(
      { user: demoAdmin, params: { userId: String(otherAdmin._id) } },
      resBlockAdmin
    );
    assert.equal(resBlockAdmin.statusCode, 400);
    assert.match(resBlockAdmin.body.message, /Cannot block another administrator/i);

    // 5. Verification status must be ∈ verified | rejected | pending only
    const resInvalidVerif = mockRes();
    await updateProviderVerification(
      { params: { providerId: String(provider._id) }, body: { status: 'unknown_status' } },
      resInvalidVerif
    );
    assert.equal(resInvalidVerif.statusCode, 400);
    assert.match(resInvalidVerif.body.message, /Invalid verification status/i);

    const resValidVerif = mockRes();
    await updateProviderVerification(
      { params: { providerId: String(provider._id) }, body: { status: 'verified' } },
      resValidVerif
    );
    assert.equal(resValidVerif.statusCode, 200);

    // 6. Admin booking filters work
    const resFilter = mockRes();
    await listAdminBookings(
      { query: { status: 'completed', urgency: 'normal', page: 1, limit: 10 } },
      resFilter
    );
    assert.equal(resFilter.statusCode, 200);
    assert.ok(Array.isArray(resFilter.body.bookings));
  } finally {
    server.close();
  }
});

test('9. Full end-to-end journey & customer payment authorization', async () => {
  const customer = await User.findOne({ email: 'arjun.customer@nearfix.in' });
  const otherCustomer = await User.findOne({ role: 'customer', _id: { $ne: customer._id } });
  const provider = await ProviderProfile.findOne({ verificationStatus: 'verified' }).populate('user');
  assert.ok(customer);
  assert.ok(otherCustomer);
  assert.ok(provider);

  // Step 1: Customer creates booking -> requested state, location saved
  const futureTime = new Date(Date.now() + 7200000).toISOString();
  const reqCreate = {
    user: customer,
    body: {
      providerId: String(provider._id),
      category: provider.categories[0] || 'plumber',
      serviceName: 'Full Journey Diagnostic',
      address: 'House #45, Phase 3B2',
      neighbourhood: 'Phase 3B2, Mohali',
      urgency: 'normal',
      scheduledFor: futureTime,
      problemDescription: 'End-to-end booking verification test',
    },
  };
  const resCreate = mockRes();
  await createBooking(reqCreate, resCreate);
  assert.equal(resCreate.statusCode, 201);
  const newBooking = resCreate.body.booking;
  assert.ok(newBooking);
  assert.equal(newBooking.status, 'requested');
  assert.equal(newBooking.paymentStatus, 'pending');
  assert.ok(newBooking.location?.coordinates);
  assert.equal(newBooking.location.coordinates.length, 2);

  // Step 2: Attempting payment on 'requested' booking fails
  const resPayEarly = mockRes();
  await processPayment({ user: customer, body: { bookingId: String(newBooking._id) } }, resPayEarly);
  assert.equal(resPayEarly.statusCode, 400);

  // Step 3: Provider accepts booking -> accepted state
  const resAccept = mockRes();
  await updateBookingStatus(
    {
      user: provider.user,
      params: { id: String(newBooking._id) },
      body: { status: 'accepted', note: 'Technician accepted job' },
    },
    resAccept
  );
  assert.equal(resAccept.statusCode, 200);

  // Step 4: Another customer attempts to pay for this booking -> 403 Forbidden
  const resPayTheft = mockRes();
  await processPayment(
    { user: otherCustomer, body: { bookingId: String(newBooking._id), method: 'upi' } },
    resPayTheft
  );
  assert.equal(resPayTheft.statusCode, 403);
  assert.match(resPayTheft.body.message, /Unauthorized payment attempt/i);

  // Step 5: Customer pays for the booking via UPI -> paid
  const resPay = mockRes();
  await processPayment(
    { user: customer, body: { bookingId: String(newBooking._id), method: 'upi' } },
    resPay
  );
  assert.equal(resPay.statusCode, 201);
  assert.ok(resPay.body.payment);
  assert.equal(resPay.body.payment.method, 'upi');
  assert.equal(resPay.body.payment.status, 'completed');

  // Verify booking paymentStatus is updated in database
  const paidBooking = await Booking.findById(newBooking._id);
  assert.equal(paidBooking.paymentStatus, 'paid');

  // Step 6: Provider starts work -> in_progress
  const resStart = mockRes();
  await updateBookingStatus(
    {
      user: provider.user,
      params: { id: String(newBooking._id) },
      body: { status: 'in_progress', note: 'Arrived and started repair' },
    },
    resStart
  );
  assert.equal(resStart.statusCode, 200);

  // Step 7: Provider completes work -> completed
  const resComplete = mockRes();
  await updateBookingStatus(
    {
      user: provider.user,
      params: { id: String(newBooking._id) },
      body: { status: 'completed', note: 'Work completed successfully' },
    },
    resComplete
  );
  assert.equal(resComplete.statusCode, 200);

  // Step 8: Customer reviews booking -> calculates new ratingAverage
  const resReview = mockRes();
  await createReview(
    {
      user: customer,
      body: {
        bookingId: String(newBooking._id),
        rating: 5,
        comment: 'Super fast arrival and excellent repair quality!',
      },
    },
    resReview
  );
  assert.equal(resReview.statusCode, 201);
  assert.ok(resReview.body.review);

  const reviewedBooking = await Booking.findById(newBooking._id);
  assert.equal(reviewedBooking.hasReview, true);

  const updatedProfile = await ProviderProfile.findById(provider._id);
  assert.ok(updatedProfile.ratingAverage >= 1.0);
  assert.ok(updatedProfile.ratingCount >= 1);

  await mongoose.disconnect();
});
