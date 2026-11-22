/**
 * bootstrap.js — Safe reference data seeder (runs in production).
 * Inserts the 10 ServiceCategory docs and 32 AreaGraph nodes if they are missing.
 * Does NOT touch users, providers, bookings, reviews or payments.
 * Run once after a fresh Atlas cluster: npm run bootstrap
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { ServiceCategory } from '../models/ServiceCategory.js';
import { AreaGraphModel } from '../models/AreaGraph.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nearfix';

const CATEGORIES = [
  { name: 'Plumber', slug: 'plumber', description: 'Expert pipe repairs, drainage clearance, tap replacements and sanitary installations.', iconKey: 'Wrench', coverImage: '/images/categories/plumber.webp', startingPrice: 349, popularSkills: ['Leak Detection', 'Drain Clearing', 'Bathroom Fixtures', 'Pipe Replacement', 'Geyser Installation'] },
  { name: 'Electrician', slug: 'electrician', description: 'Fast switchboard repairs, short circuit fixes, fan fittings and full house rewiring.', iconKey: 'Zap', coverImage: '/images/categories/electrician.webp', startingPrice: 299, popularSkills: ['Short Circuit Repair', 'MCB Switchboard Fix', 'Ceiling Fan Installation', 'Inverter Wiring', 'Appliance Power Points'] },
  { name: 'AC Repair', slug: 'ac-repair', description: 'Deep foam jet servicing, gas charging, cooling diagnosis and PCB board repair.', iconKey: 'Wind', coverImage: '/images/categories/ac-repair.webp', startingPrice: 499, popularSkills: ['Foam Jet Servicing', 'Gas Leakage Fix', 'Compressor Check', 'AC Installation & Uninstallation', 'Cooling Coil Cleaning'] },
  { name: 'Painter', slug: 'painter', description: 'Wall putty application, interior emulsion, waterproofing coat and door enamel finishing.', iconKey: 'Paintbrush', coverImage: '/images/categories/painter.webp', startingPrice: 599, popularSkills: ['Wall Putty Application', 'Interior Emulsion', 'Exterior Weather Coat', 'Texture Walls', 'Door Enamel Polish'] },
  { name: 'Carpenter', slug: 'carpenter', description: 'Door lock replacements, hinge repair, wardrobe assembly and custom wood trim.', iconKey: 'Hammer', coverImage: '/images/categories/carpenter.webp', startingPrice: 399, popularSkills: ['Door Lock Fitting', 'Hydraulic Hinge Repair', 'Modular Kitchen Drawer', 'Furniture Assembly', 'Bed Frame Repair'] },
  { name: 'Home Cleaning', slug: 'home-cleaning', description: 'Deep bathroom scrubbing, kitchen degreasing, sofa shampooing and balcony sanitisation.', iconKey: 'Sparkles', coverImage: '/images/categories/home-cleaning.webp', startingPrice: 799, popularSkills: ['Deep Bathroom Scrubbing', 'Kitchen Degreasing', 'Sofa Shampooing', 'Full House Sanitisation', 'Balcony Floor Buffing'] },
  { name: 'Appliance Repair', slug: 'appliance-repair', description: 'Washing machines, refrigerators, microwaves and domestic motor fixes.', iconKey: 'Tv', coverImage: '/images/categories/appliance-repair.webp', startingPrice: 349, popularSkills: ['Washing Machine Drum Fix', 'Refrigerator Thermostat & Gas', 'Microwave Magnetron Check', 'Mixer Grinder Motor Fix', 'Dishwasher Maintenance'] },
  { name: 'Pest Control', slug: 'pest-control', description: 'Herbal gel for cockroaches, anti-termite piping treatment and bed bug eradication.', iconKey: 'ShieldAlert', coverImage: '/images/categories/pest-control.webp', startingPrice: 649, popularSkills: ['Cockroach Herbal Gel', 'Anti-Termite Drilling', 'Bed Bug Heat Treatment', 'Mosquito Fogging', 'Rodent Baiting'] },
  { name: 'Water Purifier Service', slug: 'water-purifier', description: 'RO membrane replacement, sediment carbon filter change, TDS check and booster pump repair.', iconKey: 'Droplets', coverImage: '/images/categories/water-purifier.webp', startingPrice: 399, popularSkills: ['RO Filter Replacement', 'TDS Level Adjustment', 'Booster Pump Replacement', 'UV Lamp Fix', 'Water Leakage Clearance'] },
  { name: 'CCTV and Wi-Fi Setup', slug: 'cctv-wifi', description: 'IP camera installation, DVR/NVR configuration, mesh Wi-Fi setup and optical fibre cabling.', iconKey: 'Wifi', coverImage: '/images/categories/cctv-wifi.webp', startingPrice: 499, popularSkills: ['Dome & Bullet Camera Fitting', 'NVR/DVR Network Config', 'Mesh Wi-Fi Router Range Setup', 'LAN & Fibre Patch Cabling', 'Mobile Remote View Sync'] },
];

const TRICITY_AREAS = [
  { name: 'Sector 17, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7415, lng: 76.7794 } },
  { name: 'Sector 22, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7329, lng: 76.7701 } },
  { name: 'Sector 35, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7225, lng: 76.7562 } },
  { name: 'Sector 43, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7142, lng: 76.7431 } },
  { name: 'Sector 8, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7456, lng: 76.7952 } },
  { name: 'Sector 15, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7521, lng: 76.7684 } },
  { name: 'Sector 26, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7291, lng: 76.8112 } },
  { name: 'Sector 34, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7214, lng: 76.7711 } },
  { name: 'Sector 46, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7021, lng: 76.7645 } },
  { name: 'Sector 20, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7210, lng: 76.7865 } },
  { name: 'Sector 38, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7432, lng: 76.7410 } },
  { name: 'Mani Majra, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7231, lng: 76.8456 } },
  { name: 'Phase 3B2, Mohali', region: 'Mohali', coordinates: { lat: 30.7112, lng: 76.7210 } },
  { name: 'Phase 5, Mohali', region: 'Mohali', coordinates: { lat: 30.7180, lng: 76.7125 } },
  { name: 'Phase 7, Mohali', region: 'Mohali', coordinates: { lat: 30.7050, lng: 76.7110 } },
  { name: 'Sector 70, Mohali', region: 'Mohali', coordinates: { lat: 30.6975, lng: 76.7234 } },
  { name: 'Sector 71, Mohali', region: 'Mohali', coordinates: { lat: 30.6980, lng: 76.7089 } },
  { name: 'Phase 10, Mohali', region: 'Mohali', coordinates: { lat: 30.6865, lng: 76.7321 } },
  { name: 'Phase 11, Mohali', region: 'Mohali', coordinates: { lat: 30.6780, lng: 76.7350 } },
  { name: 'Sector 68, Mohali', region: 'Mohali', coordinates: { lat: 30.6912, lng: 76.7380 } },
  { name: 'Sector 82, Mohali', region: 'Mohali', coordinates: { lat: 30.6554, lng: 76.7356 } },
  { name: 'Kharar Road, Mohali', region: 'Mohali', coordinates: { lat: 30.7412, lng: 76.6789 } },
  { name: 'Sector 79, Mohali', region: 'Mohali', coordinates: { lat: 30.6789, lng: 76.7123 } },
  { name: 'Phase 1, Mohali', region: 'Mohali', coordinates: { lat: 30.7321, lng: 76.7214 } },
  { name: 'Sector 5, Panchkula', region: 'Panchkula', coordinates: { lat: 30.6945, lng: 76.8564 } },
  { name: 'Sector 7, Panchkula', region: 'Panchkula', coordinates: { lat: 30.6912, lng: 76.8450 } },
  { name: 'Sector 11, Panchkula', region: 'Panchkula', coordinates: { lat: 30.6850, lng: 76.8480 } },
  { name: 'Sector 14, Panchkula', region: 'Panchkula', coordinates: { lat: 30.6780, lng: 76.8521 } },
  { name: 'Sector 20, Panchkula', region: 'Panchkula', coordinates: { lat: 30.6650, lng: 76.8410 } },
  { name: 'Sector 4, Panchkula', region: 'Panchkula', coordinates: { lat: 30.7020, lng: 76.8621 } },
  { name: 'MDC Sector 4, Panchkula', region: 'Panchkula', coordinates: { lat: 30.7180, lng: 76.8489 } },
  { name: 'Industrial Area, Panchkula', region: 'Panchkula', coordinates: { lat: 30.6720, lng: 76.8610 } },
];

const ROAD_EDGES = [
  ['Sector 17, Chandigarh', 'Sector 22, Chandigarh', 1.8], ['Sector 22, Chandigarh', 'Sector 35, Chandigarh', 2.1], ['Sector 35, Chandigarh', 'Sector 43, Chandigarh', 2.4], ['Sector 17, Chandigarh', 'Sector 8, Chandigarh', 2.0], ['Sector 17, Chandigarh', 'Sector 15, Chandigarh', 2.2], ['Sector 8, Chandigarh', 'Sector 26, Chandigarh', 2.6], ['Sector 22, Chandigarh', 'Sector 20, Chandigarh', 2.1], ['Sector 35, Chandigarh', 'Sector 34, Chandigarh', 1.9], ['Sector 34, Chandigarh', 'Sector 46, Chandigarh', 2.5], ['Sector 43, Chandigarh', 'Sector 46, Chandigarh', 2.8], ['Sector 15, Chandigarh', 'Sector 38, Chandigarh', 2.7], ['Sector 26, Chandigarh', 'Mani Majra, Chandigarh', 3.8], ['Phase 1, Mohali', 'Phase 5, Mohali', 2.3], ['Phase 5, Mohali', 'Phase 3B2, Mohali', 1.6], ['Phase 3B2, Mohali', 'Phase 7, Mohali', 1.4], ['Phase 7, Mohali', 'Sector 70, Mohali', 1.8], ['Sector 70, Mohali', 'Sector 71, Mohali', 1.5], ['Phase 7, Mohali', 'Phase 10, Mohali', 2.4], ['Phase 10, Mohali', 'Phase 11, Mohali', 1.5], ['Sector 70, Mohali', 'Sector 68, Mohali', 1.9], ['Sector 68, Mohali', 'Sector 79, Mohali', 2.2], ['Sector 79, Mohali', 'Sector 82, Mohali', 3.2], ['Phase 5, Mohali', 'Kharar Road, Mohali', 4.5], ['Sector 5, Panchkula', 'Sector 7, Panchkula', 1.2], ['Sector 7, Panchkula', 'Sector 11, Panchkula', 1.5], ['Sector 11, Panchkula', 'Sector 14, Panchkula', 1.3], ['Sector 14, Panchkula', 'Sector 20, Panchkula', 2.1], ['Sector 5, Panchkula', 'Sector 4, Panchkula', 1.4], ['Sector 5, Panchkula', 'MDC Sector 4, Panchkula', 2.8], ['Sector 14, Panchkula', 'Industrial Area, Panchkula', 1.9], ['Sector 43, Chandigarh', 'Phase 7, Mohali', 3.2], ['Sector 35, Chandigarh', 'Phase 3B2, Mohali', 3.8], ['Sector 38, Chandigarh', 'Phase 1, Mohali', 3.1], ['Sector 46, Chandigarh', 'Phase 10, Mohali', 3.6], ['Mani Majra, Chandigarh', 'MDC Sector 4, Panchkula', 2.4], ['Sector 26, Chandigarh', 'Sector 5, Panchkula', 5.2], ['Sector 20, Chandigarh', 'Sector 7, Panchkula', 6.0], ['Phase 11, Mohali', 'Sector 20, Panchkula', 7.5],
];

async function bootstrap() {
  try {
    console.log('NearFix Bootstrap — reference data only');
    await mongoose.connect(MONGODB_URI);

    const catCount = await ServiceCategory.countDocuments();
    if (catCount < 10) {
      await ServiceCategory.deleteMany();
      await ServiceCategory.insertMany(CATEGORIES);
      console.log(`✓ Inserted ${CATEGORIES.length} service categories`);
    } else {
      console.log(`✓ Service categories already present (${catCount})`);
    }

    const areaCount = await AreaGraphModel.countDocuments();
    if (areaCount < 32) {
      await AreaGraphModel.deleteMany();
      const docs = TRICITY_AREAS.map((area) => {
        const edges = [];
        for (const [u, v, dist] of ROAD_EDGES) {
          if (u === area.name) edges.push({ to: v, distanceKm: dist });
          else if (v === area.name) edges.push({ to: u, distanceKm: dist });
        }
        return { name: area.name, region: area.region, coordinates: area.coordinates, edges };
      });
      await AreaGraphModel.insertMany(docs);
      console.log(`✓ Inserted ${TRICITY_AREAS.length} area graph nodes`);
    } else {
      console.log(`✓ Area graph nodes already present (${areaCount})`);
    }

    console.log('Bootstrap complete — server can be started now.');
    process.exit(0);
  } catch (err) {
    console.error('Bootstrap failed:', err.message);
    process.exit(1);
  }
}

bootstrap();
