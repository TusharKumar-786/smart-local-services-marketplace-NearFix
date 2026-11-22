import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { Notification } from '../models/Notification.js';

export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ message: 'Review comment is required' });
    }

    const booking = await Booking.findById(bookingId).populate('provider');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (String(booking.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the booking customer can submit a review' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Reviews can only be submitted after service completion' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Payment must be completed before submitting a review' });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'A review has already been submitted for this booking' });
    }

    const review = await Review.create({
      booking: booking._id,
      customer: req.user._id,
      provider: booking.provider._id,
      rating: numRating,
      comment: comment.trim(),
    });

    booking.hasReview = true;
    await booking.save();

    // Recalculate provider average rating
    const allProviderReviews = await Review.find({ provider: booking.provider._id });
    const totalRating = allProviderReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = Math.round((totalRating / allProviderReviews.length) * 10) / 10;

    await ProviderProfile.findByIdAndUpdate(booking.provider._id, {
      ratingAverage: avg,
      ratingCount: allProviderReviews.length,
    });

    // Notify provider about new review
    if (booking.provider.user) {
      await Notification.create({
        user: booking.provider.user,
        title: 'New Customer Review',
        body: `You received a ${numRating}-star review for ${booking.serviceName}.`,
        link: '/provider/dashboard',
      });
    }

    return res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to submit review' });
  }
};

export const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name avatar neighbourhood')
      .sort({ createdAt: -1 });

    return res.json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve reviews' });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Provider profile not found' });

    const reviews = await Review.find({ provider: profile._id })
      .populate('customer', 'name avatar neighbourhood')
      .populate('booking', 'serviceName')
      .sort({ createdAt: -1 });

    return res.json({
      reviews,
      ratingAverage: profile.ratingAverage,
      ratingCount: profile.ratingCount,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load reviews' });
  }
};
