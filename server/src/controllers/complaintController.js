import { Complaint } from '../models/Complaint.js';
import { Booking } from '../models/Booking.js';

export const createComplaint = async (req, res) => {
  try {
    const { bookingId, subject, description } = req.body;

    const booking = await Booking.findById(bookingId).populate('provider');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isCustomer = String(booking.customer) === String(req.user._id);
    const isProvider = String(booking.provider?.user) === String(req.user._id);

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ message: 'You are not a party to this booking' });
    }

    const againstUser = isCustomer ? booking.provider.user : booking.customer;

    const complaint = await Complaint.create({
      raisedBy: req.user._id,
      against: againstUser,
      booking: booking._id,
      subject,
      description,
      status: 'open',
    });

    return res.status(201).json({ message: 'Complaint filed successfully', complaint });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to lodge complaint' });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ raisedBy: req.user._id })
      .populate('booking')
      .populate('against', 'name phone email')
      .sort({ createdAt: -1 });

    return res.json({ complaints });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load complaints' });
  }
};
