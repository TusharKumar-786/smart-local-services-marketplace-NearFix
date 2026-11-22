import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
    category: { type: String, required: true }, // slug
    serviceName: { type: String, required: true },
    address: { type: String, required: true },
    neighbourhood: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [76.7794, 30.7333] },
    },
    urgency: {
      type: String,
      enum: ['normal', 'emergency'],
      default: 'normal',
      required: true,
    },
    scheduledFor: { type: Date, required: true },
    problemDescription: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'requested',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
      required: true,
    },
    hasReview: { type: Boolean, default: false },
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1 });
bookingSchema.index({ provider: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ urgency: 1 });
bookingSchema.index({ createdAt: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);
