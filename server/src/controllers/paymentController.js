import { Payment } from '../models/Payment.js';
import { Booking } from '../models/Booking.js';

export const processPayment = async (req, res) => {
  try {
    const { bookingId, method = 'upi' } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (String(booking.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized payment attempt' });
    }

    // Only bookings that are accepted or completed can be paid
    if (!['accepted', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        message: `Payment can only be processed for bookings that are accepted or completed. Current status: '${booking.status}'`,
      });
    }

    // Allow only one completed payment per booking
    const existingPayment = await Payment.findOne({ booking: booking._id, status: 'completed' });
    if (existingPayment || booking.paymentStatus === 'paid') {
      return res.status(400).json({
        message: 'A completed payment already exists for this booking',
      });
    }

    // Generate unique payment reference
    const reference = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Always use booking.price (ignoring any client-supplied amount)
    const payment = await Payment.create({
      booking: booking._id,
      customer: req.user._id,
      amount: booking.price,
      method,
      status: 'completed',
      reference,
    });

    booking.paymentStatus = 'paid';
    await booking.save();

    return res.status(201).json({
      message: 'Payment completed successfully',
      payment,
      booking,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Payment processing failed' });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user._id })
      .populate('booking')
      .sort({ createdAt: -1 });

    return res.json({ payments });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load payments' });
  }
};
