import mongoose from 'mongoose';

const serviceCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    iconKey: { type: String, required: true },
    coverImage: { type: String, required: true },
    startingPrice: { type: Number, default: 299 },
    popularSkills: [{ type: String }],
  },
  { timestamps: true }
);

export const ServiceCategory = mongoose.model('ServiceCategory', serviceCategorySchema);
