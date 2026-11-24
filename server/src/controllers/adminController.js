import { z } from 'zod';
import { User } from '../models/User.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Complaint } from '../models/Complaint.js';
import { Notification } from '../models/Notification.js';
import { getMatchingPipeline, syncProviderToPipeline } from './providerController.js';

export const getAnalyticsSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    // Total providers counts VERIFIED providers only
    const totalProviders = await ProviderProfile.countDocuments({ verificationStatus: 'verified' });
    const pendingProvidersCount = await ProviderProfile.countDocuments({ verificationStatus: 'pending' });
    const rejectedProvidersCount = await ProviderProfile.countDocuments({ verificationStatus: 'rejected' });
    const pendingVerificationsCount = pendingProvidersCount;

    const totalBookings = await Booking.countDocuments();
    const emergencyBookings = await Booking.countDocuments({ urgency: 'emergency' });

    // Revenue aggregate
    const revenueAggregate = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAggregate[0]?.total || 0;

    // Bookings by Status
    const bookingsByStatusAgg = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const bookingsByStatus = bookingsByStatusAgg.map((b) => ({
      status: b._id,
      count: b.count,
    }));

    // Revenue by Payment Method
    const revenueByMethodAgg = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    const revenueByMethod = revenueByMethodAgg.map((r) => ({
      method: r._id,
      total: r.total,
      count: r.count,
    }));

    // Signups last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const signupsLast7DaysAgg = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const signupsLast7Days = signupsLast7DaysAgg.map((s) => ({ date: s._id, count: s.count }));

    // Bookings last 7 days
    const bookingsLast7DaysAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const bookingsLast7Days = bookingsLast7DaysAgg.map((b) => ({ date: b._id, count: b.count }));

    // Category breakdown
    const categoryBreakdown = await Booking.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Top rated providers
    const topProviders = await ProviderProfile.find({ verificationStatus: 'verified' })
      .populate('user', 'name phone avatar neighbourhood')
      .sort({ ratingAverage: -1, ratingCount: -1 })
      .limit(5);

    // Recent complaints count
    const openComplaintsCount = await Complaint.countDocuments({ status: { $ne: 'resolved' } });

    return res.json({
      metrics: {
        totalUsers,
        totalProviders,
        pendingProvidersCount,
        rejectedProvidersCount,
        pendingVerificationsCount,
        totalBookings,
        emergencyBookings,
        totalRevenue,
        openComplaintsCount,
      },
      bookingsByStatus,
      revenueByMethod,
      signupsLast7Days,
      bookingsLast7Days,
      categoryBreakdown,
      topProviders,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate analytics' });
  }
};

export const listUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));

    const query = {};
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.json({
      users,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Admin cannot block themselves
    if (String(req.user._id) === String(userId)) {
      return res.status(400).json({ message: 'Cannot block your own administrator account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin cannot block other admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block another administrator' });
    }

    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();

    // In-app Notification to affected user
    await Notification.create({
      user: user._id,
      title: user.status === 'blocked' ? 'Account Suspended' : 'Account Re-activated',
      body:
        user.status === 'blocked'
          ? 'Your NearFix account has been suspended by an administrator.'
          : 'Your NearFix account has been re-activated by an administrator.',
      link: '/',
    });

    // If user is a provider, update matching pipeline
    if (user.role === 'provider') {
      const profile = await ProviderProfile.findOne({ user: user._id });
      if (profile) {
        await syncProviderToPipeline(profile._id);
      }
    }

    return res.json({
      message: `User ${user.name} is now ${user.status}`,
      status: user.status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user status' });
  }
};

export const listAllProviders = async (req, res) => {
  try {
    const { verificationStatus, category, area, search, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));

    const query = {};
    if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus;
    }
    if (category && category !== 'all') {
      query.categories = category;
    }
    if (area && area !== 'all') {
      query.serviceAreas = area;
    }

    let userMatches = null;
    if (search && search.trim()) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
          { phone: { $regex: search.trim(), $options: 'i' } },
        ],
      }).select('_id');
      userMatches = matchingUsers.map((u) => u._id);

      query.$or = [
        { headline: { $regex: search.trim(), $options: 'i' } },
        { user: { $in: userMatches } },
      ];
    }

    const total = await ProviderProfile.countDocuments(query);
    const providers = await ProviderProfile.find(query)
      .populate('user', 'name email phone avatar neighbourhood status')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Compute completed jobs count for each provider
    const providerIds = providers.map((p) => p._id);
    const completedAgg = await Booking.aggregate([
      { $match: { provider: { $in: providerIds }, status: 'completed' } },
      { $group: { _id: '$provider', count: { $sum: 1 } } },
    ]);
    const completedMap = new Map(completedAgg.map((c) => [String(c._id), c.count]));

    const formatted = providers.map((p) => {
      const obj = p.toObject();
      return {
        ...obj,
        completedJobs: completedMap.get(String(p._id)) || 0,
        rating: {
          average: p.ratingAverage,
          count: p.ratingCount,
        },
      };
    });

    return res.json({
      providers: formatted,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch providers' });
  }
};

export const listPendingProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find({ verificationStatus: 'pending' })
      .populate('user', 'name email phone neighbourhood status avatar')
      .sort({ createdAt: -1 });

    return res.json({ providers });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list verification queue' });
  }
};

export const updateProviderVerification = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { status } = req.body;

    // Verification status must be ∈ verified | rejected | pending only
    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        message: "Invalid verification status. Must be 'verified', 'rejected', or 'pending'.",
      });
    }

    const provider = await ProviderProfile.findByIdAndUpdate(
      providerId,
      { verificationStatus: status },
      { new: true }
    ).populate('user', 'name email phone status');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Notify the affected provider via in-app Notification
    if (provider.user) {
      await Notification.create({
        user: provider.user._id,
        title: `Technician Verification: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        body:
          status === 'verified'
            ? 'Your NearFix technician profile has been verified by the administrator.'
            : status === 'rejected'
            ? 'Your technician verification application was rejected by the administrator.'
            : 'Your technician verification status is currently pending review.',
        link: '/provider/dashboard',
      });
    }

    // Update matching pipeline
    await syncProviderToPipeline(provider._id);

    return res.json({ message: `Provider status set to ${status}`, provider });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update verification' });
  }
};

export const listAdminBookings = async (req, res) => {
  try {
    const {
      status,
      urgency,
      paymentStatus,
      category,
      provider,
      customer,
      from,
      to,
      q,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (urgency && urgency !== 'all') query.urgency = urgency;
    if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;
    if (category && category !== 'all') query.category = category;
    if (provider) query.provider = provider;
    if (customer) query.customer = customer;

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    if (q && q.trim()) {
      const searchRegex = { $regex: q.trim(), $options: 'i' };
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { phone: searchRegex }, { email: searchRegex }],
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      const matchingProviders = await ProviderProfile.find({
        $or: [{ headline: searchRegex }, { user: { $in: userIds } }],
      }).select('_id');
      const providerIds = matchingProviders.map((p) => p._id);

      query.$or = [
        { serviceName: searchRegex },
        { address: searchRegex },
        { neighbourhood: searchRegex },
        { customer: { $in: userIds } },
        { provider: { $in: providerIds } },
      ];
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('customer', 'name phone neighbourhood email')
      .populate({
        path: 'provider',
        select: 'headline pricing categories serviceAreas location user',
        populate: {
          path: 'user',
          select: 'name phone avatar email',
        },
      })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.json({
      bookings,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

export const getAdminBookingDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('customer', 'name phone email avatar neighbourhood')
      .populate({
        path: 'provider',
        populate: {
          path: 'user',
          select: 'name phone email avatar neighbourhood',
        },
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const payment = await Payment.findOne({ booking: booking._id });

    return res.json({ booking, payment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch booking details' });
  }
};

export const listAdminPayments = async (req, res) => {
  try {
    const { status, method, from, to, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (method && method !== 'all') query.method = method;

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    // Totals by method
    const totalsAgg = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const totalsByMethod = {
      upi: 0,
      card: 0,
      netbanking: 0,
      total: 0,
    };

    totalsAgg.forEach((t) => {
      if (totalsByMethod[t._id] !== undefined) {
        totalsByMethod[t._id] = t.total;
      }
      totalsByMethod.total += t.total;
    });

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('customer', 'name email phone')
      .populate({
        path: 'booking',
        select: 'serviceName category status price neighbourhood',
      })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.json({
      payments,
      totalsByMethod,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

export const getAdminActivityFeed = async (req, res) => {
  try {
    const [recentUsers, recentProviders, recentBookings, recentPayments, recentComplaints] =
      await Promise.all([
        User.find().sort({ createdAt: -1 }).limit(30).lean(),
        ProviderProfile.find()
          .populate('user', 'name email')
          .sort({ createdAt: -1 })
          .limit(30)
          .lean(),
        Booking.find()
          .populate('customer', 'name phone')
          .sort({ createdAt: -1 })
          .limit(35)
          .lean(),
        Payment.find()
          .populate('customer', 'name')
          .sort({ createdAt: -1 })
          .limit(30)
          .lean(),
        Complaint.find()
          .populate('raisedBy', 'name')
          .sort({ createdAt: -1 })
          .limit(20)
          .lean(),
      ]);

    const events = [];

    // User signups
    recentUsers.forEach((u) => {
      events.push({
        id: `user-${u._id}`,
        type: 'user_signup',
        title: 'New User Registered',
        description: `${u.name} joined NearFix as ${u.role}.`,
        timestamp: u.createdAt,
        badge: u.role,
        badgeColor: u.role === 'admin' ? 'primary' : u.role === 'provider' ? 'accent' : 'success',
      });
    });

    // Provider profiles
    recentProviders.forEach((p) => {
      events.push({
        id: `provider-${p._id}`,
        type: 'provider_joined',
        title: 'Technician Profile Created',
        description: `${p.user?.name || 'Technician'} listed trades: ${p.categories?.join(', ')}.`,
        timestamp: p.createdAt,
        badge: p.verificationStatus,
        badgeColor: p.verificationStatus === 'verified' ? 'success' : 'emergency',
      });
    });

    // Bookings & status updates
    recentBookings.forEach((b) => {
      events.push({
        id: `booking-${b._id}`,
        type: 'booking_created',
        title: `Booking ${b.status.replace('_', ' ').toUpperCase()}`,
        description: `${b.serviceName} in ${b.neighbourhood} for ₹${b.price}. Customer: ${b.customer?.name || 'Customer'}.`,
        timestamp: b.createdAt,
        badge: b.urgency === 'emergency' ? 'Emergency' : b.status,
        badgeColor: b.urgency === 'emergency' ? 'emergency' : 'primary',
      });

      // Extract subsequent status transitions
      if (b.statusHistory && b.statusHistory.length > 1) {
        b.statusHistory.slice(1).forEach((sh, idx) => {
          events.push({
            id: `booking-${b._id}-sh-${idx}`,
            type: `booking_${sh.status}`,
            title: `Job ${sh.status.replace('_', ' ').toUpperCase()}`,
            description: `${b.serviceName}: ${sh.note || `Transitioned to ${sh.status}`}.`,
            timestamp: sh.timestamp,
            badge: sh.status,
            badgeColor: sh.status === 'completed' ? 'success' : 'primary',
          });
        });
      }
    });

    // Payments
    recentPayments.forEach((pay) => {
      events.push({
        id: `payment-${pay._id}`,
        type: 'payment_settled',
        title: 'Payment Confirmed',
        description: `₹${pay.amount} settled via ${pay.method?.toUpperCase()} (Ref: ${pay.reference}).`,
        timestamp: pay.createdAt,
        badge: pay.method,
        badgeColor: 'success',
      });
    });

    // Complaints
    recentComplaints.forEach((c) => {
      events.push({
        id: `complaint-${c._id}`,
        type: 'complaint_lodged',
        title: 'Dispute Raised',
        description: `Subject: "${c.subject}". Raised by ${c.raisedBy?.name || 'User'}.`,
        timestamp: c.createdAt,
        badge: c.status,
        badgeColor: c.status === 'resolved' ? 'success' : 'emergency',
      });
    });

    // Sort descending by timestamp and take top 50
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const activities = events.slice(0, 50);

    return res.json({ activities });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to compile activity feed' });
  }
};

export const listAllComplaints = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const complaints = await Complaint.find(query)
      .populate('raisedBy', 'name email phone')
      .populate('against', 'name email phone')
      .populate('booking')
      .sort({ createdAt: -1 });

    return res.json({ complaints });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list complaints' });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, adminNote } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { status, adminNote },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.raisedBy) {
      await Notification.create({
        user: complaint.raisedBy,
        title: `Complaint Resolution Update`,
        body: `Your complaint regarding "${complaint.subject}" has been marked as ${status}. Note: ${adminNote || 'Resolution completed'}`,
        link: '/customer/bookings',
      });
    }

    return res.json({ message: 'Complaint updated', complaint });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update complaint' });
  }
};
