import { Booking } from '../models/Booking.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { Notification } from '../models/Notification.js';

export const createBooking = async (req, res) => {
  try {
    const {
      providerId,
      category,
      serviceName,
      address,
      neighbourhood,
      urgency = 'normal',
      scheduledFor,
      problemDescription,
      price,
    } = req.body;

    const provider = await ProviderProfile.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    const bookingPrice = price || provider.pricing?.visitCharge || 350;

    const booking = await Booking.create({
      customer: req.user._id,
      provider: provider._id,
      category,
      serviceName: serviceName || 'General Service',
      address,
      neighbourhood: neighbourhood || req.user.neighbourhood || 'Sector 17, Chandigarh',
      urgency,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(Date.now() + 3600000),
      problemDescription,
      price: bookingPrice,
      status: 'requested',
      paymentStatus: 'pending',
      statusHistory: [
        {
          status: 'requested',
          note: urgency === 'emergency' ? 'Emergency service requested' : 'Standard booking initiated',
          timestamp: new Date(),
        },
      ],
    });

    // Notify provider
    await Notification.create({
      user: provider.user,
      title: urgency === 'emergency' ? '🚨 Urgent Emergency Booking!' : 'New Booking Request',
      body: `Customer in ${booking.neighbourhood} requested ${booking.serviceName}.`,
      link: `/provider/bookings`,
    });

    return res.status(201).json({ message: 'Booking requested successfully', booking });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create booking' });
  }
};

export const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name phone avatar' },
      })
      .sort({ createdAt: -1 });

    return res.json({ bookings });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve bookings' });
  }
};

export const getProviderBookings = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const bookings = await Booking.find({ provider: profile._id })
      .populate('customer', 'name phone email avatar neighbourhood')
      .sort({ createdAt: -1 });

    return res.json({ bookings });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve provider bookings' });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name phone email avatar neighbourhood')
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name phone avatar' },
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Role security check
    const isCustomer = String(booking.customer._id) === String(req.user._id);
    const isProvider = String(booking.provider?.user?._id) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    return res.json({ booking });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load booking' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const booking = await Booking.findById(req.params.id).populate('provider');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const validStatuses = ['requested', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    booking.status = status;
    booking.statusHistory.push({
      status,
      note: note || `Status transitioned to ${status}`,
      timestamp: new Date(),
    });

    if (status === 'completed') {
      // Accumulate earnings for provider
      await ProviderProfile.findByIdAndUpdate(booking.provider._id, {
        $inc: { earningsTotal: booking.price },
      });
    }

    await booking.save();

    // Notify counterpart
    const targetUserId =
      String(req.user._id) === String(booking.customer)
        ? booking.provider.user
        : booking.customer;

    await Notification.create({
      user: targetUserId,
      title: `Booking Update: ${status.replace('_', ' ').toUpperCase()}`,
      body: `Booking for ${booking.serviceName} is now ${status.replace('_', ' ')}.`,
      link: `/bookings/${booking._id}`,
    });

    return res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update status' });
  }
};
