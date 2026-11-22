import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      default: 'customer',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
      required: true,
    },
    avatar: { type: String, default: '' },
    address: { type: String, default: '' },
    neighbourhood: { type: String, default: 'Sector 17, Chandigarh' },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export const User = mongoose.model('User', userSchema);
