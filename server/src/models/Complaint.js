import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    against: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved'],
      default: 'open',
    },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

complaintSchema.index({ raisedBy: 1 });
complaintSchema.index({ status: 1 });

export const Complaint = mongoose.model('Complaint', complaintSchema);
