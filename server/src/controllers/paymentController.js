import { Payment } from '../models/Payment.js';
import { Booking } from '../models/Booking.js';

export const processPayment = async (req, res) => {
  try {
    const { bookingId, amount, method = 'upi' } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (String(booking.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized payment attempt' });
    }

    // Generate unique payment reference
    const reference = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      booking: booking._id,
      customer: req.user._id,
      amount: amount || booking.price,
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
    return res.status(500).json({ message: 'Payment processing failed' });
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
