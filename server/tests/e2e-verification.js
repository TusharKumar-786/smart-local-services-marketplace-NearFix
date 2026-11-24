import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { createApp } from '../src/app.js';
import { initializeEngine } from '../src/server.js';
import { User } from '../src/models/User.js';
import { ProviderProfile } from '../src/models/ProviderProfile.js';
import { Booking } from '../src/models/Booking.js';
import { Payment } from '../src/models/Payment.js';
import { Notification } from '../src/models/Notification.js';

const PORT = 5055;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

async function runEndToEndVerification() {
  console.log('\n======================================================');
  console.log('STARTING FULL END-TO-END VERIFICATION (PHASE 2)');
  console.log('======================================================\n');

  // Connect to DB and warm up engine
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  const pipeline = await initializeEngine();
  const app = createApp();

  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`[Test Server] Running on http://127.0.0.1:${PORT}`);
  });

  try {
    const timestamp = Date.now();
    const providerEmail = `harpreet_${timestamp}@nearfix.in`;
    const customerEmail = `anita_${timestamp}@nearfix.in`;
    const adminEmail = 'admin@nearfix.in';
    const defaultPassword = 'TestPassword123!';

    // ------------------------------------------------------------------
    // Step a: New provider signs up -> verificationStatus "pending" -> NOT visible in search
    // ------------------------------------------------------------------
    console.log('\n--- Step a: New provider signs up (pending) ---');
    const provRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Harpreet Singh',
        email: providerEmail,
        phone: '9876543210',
        password: defaultPassword,
        role: 'provider',
        headline: 'Master Plumber & Sanitary Expert',
        categories: ['plumber'],
        neighbourhood: 'Phase 7, Mohali',
      }),
    });
    const provRegData = await provRegRes.json();
    console.log('Provider Registered:', provRegRes.status, provRegData.message);
    if (provRegRes.status !== 201) throw new Error('Provider registration failed');

    const providerUser = await User.findOne({ email: providerEmail });
    const providerProfile = await ProviderProfile.findOne({ user: providerUser._id });
    console.log('Provider Profile verificationStatus:', providerProfile.verificationStatus);
    if (providerProfile.verificationStatus !== 'pending') {
      throw new Error(`Expected verificationStatus to be 'pending', got ${providerProfile.verificationStatus}`);
    }

    // Verify NOT in customer search
    const preVerifySearchRes = await fetch(`${BASE_URL}/providers/search?service=plumber&area=Phase+7,+Mohali`);
    const preVerifySearchData = await preVerifySearchRes.json();
    const foundPreVerify = preVerifySearchData.providers.some(
      (p) => String(p._id) === String(providerProfile._id)
    );
    console.log('Is pending provider in search results before admin verification?', foundPreVerify ? 'YES (FAIL)' : 'NO (CORRECT)');
    if (foundPreVerify) throw new Error('Unverified pending provider must NOT be visible in search');

    // ------------------------------------------------------------------
    // Step b: Admin logs in and verifies provider -> immediately visible in search with distance & ETA
    // ------------------------------------------------------------------
    console.log('\n--- Step b: Admin logs in and verifies provider ---');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: 'AdminPass123!',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    console.log('Admin Login:', adminLoginRes.status, 'Role:', adminLoginData.user?.role);
    if (adminLoginRes.status !== 200 || adminLoginData.user?.role !== 'admin') {
      throw new Error('Admin login failed');
    }
    const adminToken = adminLoginData.token;

    // Verify provider
    const verifyRes = await fetch(`${BASE_URL}/admin/providers/${providerProfile._id}/verification`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'verified' }),
    });
    const verifyData = await verifyRes.json();
    console.log('Admin verified provider:', verifyRes.status, verifyData.message);
    if (verifyRes.status !== 200) throw new Error('Admin verification update failed');

    // Verify IMMEDIATELY in customer search without server restart
    const postVerifySearchRes = await fetch(`${BASE_URL}/providers/search?service=plumber&area=Phase+7,+Mohali`);
    const postVerifySearchData = await postVerifySearchRes.json();
    const verifiedResult = postVerifySearchData.providers.find(
      (p) => String(p._id) === String(providerProfile._id)
    );
    console.log('Found verified provider in customer search?', !!verifiedResult ? 'YES (CORRECT)' : 'NO (FAIL)');
    if (!verifiedResult) throw new Error('Verified provider must appear immediately in search');
    console.log(`Provider name: "${verifiedResult.name}", Distance: ${verifiedResult.distanceKm} km, ETA: ${verifiedResult.etaMinutes} min`);
    if (verifiedResult.name === 'Local Technician') {
      throw new Error('Provider name reverted to "Local Technician"!');
    }
    if (typeof verifiedResult.distanceKm !== 'number' || typeof verifiedResult.etaMinutes !== 'number') {
      throw new Error('DistanceKm and etaMinutes must be present on search result');
    }

    // ------------------------------------------------------------------
    // Step c: Customer logs in, searches, opens provider profile, creates booking
    // ------------------------------------------------------------------
    console.log('\n--- Step c: Customer registers/logs in & creates booking ---');
    const custRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Anita Verma',
        email: customerEmail,
        phone: '9812345678',
        password: defaultPassword,
        role: 'customer',
        neighbourhood: 'Phase 7, Mohali',
      }),
    });
    const custRegData = await custRegRes.json();
    console.log('Customer Registered:', custRegRes.status);
    const customerToken = custRegData.token;

    // Customer opens provider profile
    const profileRes = await fetch(`${BASE_URL}/providers/${providerProfile._id}?area=Phase+7,+Mohali`);
    const profileData = await profileRes.json();
    console.log('Fetched Provider Detail Page:', profileRes.status, 'Distance:', profileData.provider?.distanceKm, 'ETA:', profileData.provider?.etaMinutes);
    if (typeof profileData.provider?.distanceKm !== 'number' || typeof profileData.provider?.etaMinutes !== 'number') {
      throw new Error('Provider profile detail must contain distanceKm and etaMinutes');
    }

    // Customer creates booking
    const bookingRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        providerId: String(providerProfile._id),
        category: 'plumber',
        serviceName: 'Pipe Leakage Repair',
        address: 'House #42, Phase 7, Mohali',
        neighbourhood: 'Phase 7, Mohali',
        urgency: 'normal',
        scheduledFor: new Date(Date.now() + 3600000).toISOString(),
        problemDescription: 'Kitchen sink pipe is leaking heavily under the counter.',
      }),
    });
    const bookingData = await bookingRes.json();
    console.log('Booking Created:', bookingRes.status, 'Booking ID:', bookingData.booking?._id, 'Status:', bookingData.booking?.status);
    if (bookingRes.status !== 201) throw new Error('Booking creation failed');
    const bookingId = bookingData.booking._id;

    // ------------------------------------------------------------------
    // Step d: Provider logs in, accepts booking, moves to in_progress and completed
    // ------------------------------------------------------------------
    console.log('\n--- Step d: Provider logs in, accepts, progresses, and completes booking ---');
    const provLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: providerEmail,
        password: defaultPassword,
      }),
    });
    const provLoginData = await provLoginRes.json();
    console.log('Provider Login:', provLoginRes.status);
    const providerToken = provLoginData.token;

    // Accept booking
    const acceptRes = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${providerToken}`,
      },
      body: JSON.stringify({ status: 'accepted', note: 'I am on my way with tools.' }),
    });
    const acceptData = await acceptRes.json();
    console.log('Booking Accepted:', acceptRes.status, 'New Status:', acceptData.booking?.status);
    if (acceptData.booking?.status !== 'accepted') throw new Error('Failed to set booking to accepted');

    // Move to in_progress
    const inProgressRes = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${providerToken}`,
      },
      body: JSON.stringify({ status: 'in_progress', note: 'Arrived at location and started repairs.' }),
    });
    const inProgressData = await inProgressRes.json();
    console.log('Booking In Progress:', inProgressRes.status, 'New Status:', inProgressData.booking?.status);
    if (inProgressData.booking?.status !== 'in_progress') throw new Error('Failed to set booking to in_progress');

    // Move to completed
    const completeRes = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${providerToken}`,
      },
      body: JSON.stringify({ status: 'completed', note: 'Leak fixed and valve replaced.' }),
    });
    const completeData = await completeRes.json();
    console.log('Booking Completed:', completeRes.status, 'New Status:', completeData.booking?.status);
    if (completeData.booking?.status !== 'completed') throw new Error('Failed to set booking to completed');

    // ------------------------------------------------------------------
    // Step e: Customer sees live tracking/detail & payment flow works
    // ------------------------------------------------------------------
    console.log('\n--- Step e: Customer checks booking detail & completes payment ---');
    const custBookingRes = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const custBookingData = await custBookingRes.json();
    console.log('Customer Fetched Booking:', custBookingRes.status, 'Price:', custBookingData.booking?.price);

    const paymentRes = await fetch(`${BASE_URL}/payments/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        bookingId: String(bookingId),
        paymentMethod: 'upi',
      }),
    });
    const paymentData = await paymentRes.json();
    console.log('Payment Processed:', paymentRes.status, 'Status:', paymentData.payment?.status, 'Amount: ₹' + paymentData.payment?.amount);
    if (paymentRes.status !== 201 || paymentData.payment?.status !== 'completed') {
      throw new Error('Payment processing failed');
    }

    // ------------------------------------------------------------------
    // Step f: Customer posts a review -> provider rating updates in search
    // ------------------------------------------------------------------
    console.log('\n--- Step f: Customer posts 5-star review -> rating updates in search ---');
    const reviewRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        bookingId: String(bookingId),
        rating: 5,
        comment: 'Harpreet did an outstanding job! Arrived promptly and solved the issue quickly.',
      }),
    });
    const reviewData = await reviewRes.json();
    console.log('Review Posted:', reviewRes.status, reviewData.message);
    if (reviewRes.status !== 201) throw new Error('Review creation failed');

    // Verify rating in customer search
    const postReviewSearchRes = await fetch(`${BASE_URL}/providers/search?service=plumber&area=Phase+7,+Mohali`);
    const postReviewSearchData = await postReviewSearchRes.json();
    const reviewedProvider = postReviewSearchData.providers.find(
      (p) => String(p._id) === String(providerProfile._id)
    );
    console.log(`Updated Provider in Search: Rating = ${reviewedProvider?.ratingAverage}, Count = ${reviewedProvider?.ratingCount}`);
    if (reviewedProvider?.ratingAverage !== 5 || reviewedProvider?.ratingCount !== 1) {
      throw new Error(`Expected rating 5 and count 1, got ${reviewedProvider?.ratingAverage} (${reviewedProvider?.ratingCount})`);
    }

    // ------------------------------------------------------------------
    // Step g: Notifications created for both sides
    // ------------------------------------------------------------------
    console.log('\n--- Step g: Verify notifications for provider & customer ---');
    const provNotifs = await Notification.find({ user: providerUser._id });
    const custUser = await User.findOne({ email: customerEmail });
    const custNotifs = await Notification.find({ user: custUser._id });
    console.log(`Provider has ${provNotifs.length} notifications:`, provNotifs.map((n) => n.title));
    console.log(`Customer has ${custNotifs.length} notifications:`, custNotifs.map((n) => n.title));
    if (provNotifs.length === 0 || custNotifs.length === 0) {
      throw new Error('Both provider and customer should have notifications generated');
    }

    // ------------------------------------------------------------------
    // Step h: Provider toggles offline -> search shows them offline or properly filtered
    // ------------------------------------------------------------------
    console.log('\n--- Step h: Provider toggles availability to offline ---');
    const toggleRes = await fetch(`${BASE_URL}/providers/toggle-availability`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerToken}` },
    });
    const toggleData = await toggleRes.json();
    console.log('Availability Toggled:', toggleRes.status, toggleData.message, 'isAvailableNow:', toggleData.isAvailableNow);
    if (toggleData.isAvailableNow !== false) {
      throw new Error('Expected isAvailableNow to toggle to false');
    }

    // Verify in search
    const postToggleSearchRes = await fetch(`${BASE_URL}/providers/search?service=plumber&area=Phase+7,+Mohali&sort=availability`);
    const postToggleSearchData = await postToggleSearchRes.json();
    const toggledProvider = postToggleSearchData.providers.find(
      (p) => String(p._id) === String(providerProfile._id)
    );
    console.log('Provider in search availability:', toggledProvider?.availability?.isAvailableNow);
    if (toggledProvider?.availability?.isAvailableNow !== false) {
      throw new Error('Provider in search must reflect offline availability');
    }

    console.log('\n======================================================');
    console.log('ALL PHASE 2 END-TO-END VERIFICATION STEPS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runEndToEndVerification().catch((err) => {
  console.error('\nVERIFICATION FAILED:', err);
  process.exit(1);
});
