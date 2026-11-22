import mongoose from 'mongoose';
import { z } from 'zod';
import { Booking } from '../models/Booking.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { Notification } from '../models/Notification.js';

const createBookingSchema = z.object({
  providerId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid provider ID',
  }),
  category: z.string().min(1, 'Category is required'),
  serviceName: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  neighbourhood: z.string().optional(),
  urgency: z.enum(['normal', 'emergency']).default('normal'),
  scheduledFor: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
    message: 'Scheduled date and time must be in the future',
  }),
  problemDescription: z.string().min(1, 'Problem description is required'),
  price: z.any().optional(), // Ignored: computed server-side
});

const ALLOWED_TRANSITIONS = {
  requested: ['accepted', 'rejected', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  rejected: [],
  cancelled: [],
};

export const createBooking = async (req, res) => {
  try {
    const parseResult = createBookingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0]?.message || 'Validation failed for booking request',
      });
    }

    const {
      providerId,
      category,
      serviceName,
      address,
      neighbourhood,
      urgency,
      scheduledFor,
      problemDescription,
    } = parseResult.data;

    const provider = await ProviderProfile.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    // Server-computed pricing: Ignore client price
    const bookingPrice = provider.pricing?.visitCharge || 350;

    const booking = await Booking.create({
      customer: req.user._id,
      provider: provider._id,
      category,
      serviceName: serviceName || `${category.charAt(0).toUpperCase() + category.slice(1)} Service`,
      address,
      neighbourhood: neighbourhood || req.user.neighbourhood || 'Sector 17, Chandigarh',
      urgency,
      scheduledFor,
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
    if (error.name === 'ValidationError') {
      const firstKey = Object.keys(error.errors)[0];
      return res.status(400).json({ message: error.errors[firstKey]?.message || 'Invalid booking data' });
    }
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

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

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(req.params.id).populate('provider');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const validStatuses = ['requested', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status: '${status}'` });
    }

    // Authorization checks
    const isCustomer = String(booking.customer) === String(req.user._id);
    const isProvider = String(booking.provider?.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Customer authorization rule: customer may ONLY set cancelled
    if (isCustomer && !isAdmin && status !== 'cancelled') {
      return res.status(403).json({ message: 'Customers may only cancel a booking' });
    }

    // Provider authorization rule: provider may set accepted, rejected, in_progress, completed
    if (isProvider && !isAdmin && !['accepted', 'rejected', 'in_progress', 'completed'].includes(status)) {
      return res.status(403).json({
        message: 'Providers may only accept, reject, start, or complete a booking',
      });
    }

    // State machine validation
    const currentStatus = booking.status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

    // Admins can override transitions if needed, but state machine applies to regular users
    if (!isAdmin && !allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from '${currentStatus}' to '${status}'.`,
      });
    }

    // Provider earnings added only ONCE on first transition to completed
    const wasEverCompleted = booking.statusHistory?.some((h) => h.status === 'completed') || booking.status === 'completed';
    if (status === 'completed' && !wasEverCompleted) {
      await ProviderProfile.findByIdAndUpdate(booking.provider._id, {
        $inc: { earningsTotal: booking.price },
      });
    }

    booking.status = status;
    booking.statusHistory.push({
      status,
      note: note || `Status transitioned to ${status}`,
      timestamp: new Date(),
    });

    await booking.save();

    // Enhanced bidirectional notifications per status transition
    const isActorCustomer = String(req.user._id) === String(booking.customer);
    if (status === 'accepted') {
      await Notification.create({
        user: booking.customer,
        title: 'Booking Confirmed',
        body: `Your ${booking.serviceName} booking has been accepted. The technician will arrive as scheduled.`,
        link: '/customer/bookings',
      });
    } else if (status === 'rejected') {
      await Notification.create({
        user: booking.customer,
        title: 'Booking Not Available',
        body: `The technician could not accept your ${booking.serviceName} request. Please try another nearby professional.`,
        link: '/search',
      });
    } else if (status === 'in_progress') {
      await Notification.create({
        user: booking.customer,
        title: 'Work Started',
        body: `Your ${booking.serviceName} service is now in progress.`,
        link: `/track/${booking._id}`,
      });
    } else if (status === 'completed') {
      await Notification.create({
        user: booking.customer,
        title: 'Service Completed',
        body: `Your ${booking.serviceName} is complete. Please rate and review the technician.`,
        link: '/customer/bookings',
      });
    } else if (status === 'cancelled' && isActorCustomer) {
      await Notification.create({
        user: booking.provider.user,
        title: 'Booking Cancelled',
        body: `A customer cancelled their ${booking.serviceName} booking.`,
        link: '/provider/dashboard',
      });
    }

    return res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update status' });
  }
};
