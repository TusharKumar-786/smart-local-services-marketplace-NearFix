import mongoose from 'mongoose';

const providerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: { type: String, required: true, trim: true },
    bio: { type: String, required: true },
    categories: [{ type: String, required: true }], // category slugs e.g. 'plumber', 'ac-repair'
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 3 },
    serviceAreas: [{ type: String }], // Neighbourhood nodes e.g. 'Sector 70 Mohali'
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [76.7794, 30.7333] }, // [lng, lat]
    },
    pricing: {
      visitCharge: { type: Number, required: true, default: 350 },
      hourlyRate: { type: Number, required: true, default: 250 },
    },
    availability: {
      days: [{ type: String }],
      hours: { type: String, default: '8:00 AM - 8:00 PM' },
      isAvailableNow: { type: Boolean, default: true },
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'verified',
    },
    ratingAverage: { type: Number, default: null, min: 1.0, max: 5.0 },
    ratingCount: { type: Number, default: 0 },
    earningsTotal: { type: Number, default: 0 },
    photos: [{ type: String }],
  },
  { timestamps: true }
);

providerProfileSchema.index({ location: '2dsphere' });
providerProfileSchema.index({ categories: 1 });
providerProfileSchema.index({ verificationStatus: 1 });
providerProfileSchema.index({ ratingAverage: -1 });

export const ProviderProfile = mongoose.model('ProviderProfile', providerProfileSchema);
