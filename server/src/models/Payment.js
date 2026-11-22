import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'cash'],
      default: 'upi',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    reference: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

paymentSchema.index({ booking: 1 });
paymentSchema.index({ customer: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
