import { User } from '../models/User.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Complaint } from '../models/Complaint.js';

export const getAnalyticsSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProviders = await ProviderProfile.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const emergencyBookings = await Booking.countDocuments({ urgency: 'emergency' });

    // Revenue aggregate
    const revenueAggregate = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAggregate[0]?.total || 0;

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
    const openComplaintsCount = await Complaint.countDocuments({ status: 'open' });
    const pendingVerificationsCount = await ProviderProfile.countDocuments({
      verificationStatus: 'pending',
    });

    return res.json({
      metrics: {
        totalUsers,
        totalProviders,
        totalBookings,
        emergencyBookings,
        totalRevenue,
        openComplaintsCount,
        pendingVerificationsCount,
      },
      categoryBreakdown,
      topProviders,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate analytics' });
  }
};

export const listUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();

    return res.json({
      message: `User ${user.name} is now ${user.status}`,
      status: user.status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user status' });
  }
};

export const listPendingProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find()
      .populate('user', 'name email phone neighbourhood status')
      .sort({ createdAt: -1 });

    return res.json({ providers });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list verification queue' });
  }
};

export const updateProviderVerification = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { status } = req.body; // 'verified' | 'rejected'

    const provider = await ProviderProfile.findByIdAndUpdate(
      providerId,
      { verificationStatus: status },
      { new: true }
    ).populate('user', 'name email');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    return res.json({ message: `Provider status set to ${status}`, provider });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update verification' });
  }
};

export const listAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
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

    return res.json({ message: 'Complaint updated', complaint });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update complaint' });
  }
};
