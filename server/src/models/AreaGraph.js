import mongoose from 'mongoose';

const areaGraphSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "Sector 17, Chandigarh"
    region: { type: String, enum: ['Chandigarh', 'Mohali', 'Panchkula'], required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    edges: [
      {
        to: { type: String, required: true },
        distanceKm: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const AreaGraphModel = mongoose.model('AreaGraph', areaGraphSchema);
