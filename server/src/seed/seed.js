import dotenv from 'dotenv';
dotenv.config();

// Block seed in production
if (process.env.NODE_ENV === 'production') {
  console.error('Seed is blocked in production. Use bootstrap + create-admin instead.');
  process.exit(1);
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { User } from '../models/User.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { ServiceCategory } from '../models/ServiceCategory.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Payment } from '../models/Payment.js';
import { Complaint } from '../models/Complaint.js';
import { Notification } from '../models/Notification.js';
import { AreaGraphModel } from '../models/AreaGraph.js';

// Block seed in production
if (process.env.NODE_ENV === 'production') {
  console.error('Seed is blocked in production. Use bootstrap + create-admin instead.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nearfix';

// Helper for deterministic avatar fallback
function getProviderAvatar(name, index) {
  const fileName = `provider-${String(index).padStart(3, '0')}.webp`;
  const localFile = path.resolve(__dirname, `../../../client/public/images/providers/${fileName}`);
  if (fs.existsSync(localFile)) {
    return `/images/providers/${fileName}`;
  }

  // Deterministic SVG data URI with distinct brand palette colours
  const colors = [
    '#0F5C63', '#166269', '#1E727A', '#F2A32C', '#D98A19',
    '#2E8B57', '#25794B', '#379B63', '#B85D19', '#9C4D15',
    '#2D4B59', '#3D6273', '#4E7385', '#7A4833', '#8C523A',
    '#3B5F58', '#4A756D', '#2B5750', '#855938', '#6E482C',
  ];
  const bg = colors[(index * 7 + 3) % colors.length];
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="50" fill="${bg}"/><circle cx="50" cy="50" r="47" stroke="#FAF7F2" stroke-width="2" stroke-opacity="0.3" fill="none"/><text x="50" y="58" font-family="'Plus Jakarta Sans', Manrope, sans-serif" font-size="34" font-weight="700" fill="#FAF7F2" text-anchor="middle" letter-spacing="1">${initials}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 1. 10 Service Categories
const CATEGORIES = [
  {
    name: 'Plumber',
    slug: 'plumber',
    description: 'Expert pipe repairs, drainage clearance, tap replacements and sanitary installations.',
    iconKey: 'Wrench',
    coverImage: '/images/categories/plumber.webp',
    startingPrice: 349,
    popularSkills: ['Leak Detection', 'Drain Clearing', 'Bathroom Fixtures', 'Pipe Replacement', 'Geyser Installation'],
  },
  {
    name: 'Electrician',
    slug: 'electrician',
    description: 'Certified electricians for wiring, panel repairs, appliance connections and emergency power issues.',
    iconKey: 'Zap',
    coverImage: '/images/categories/electrician.webp',
    startingPrice: 349,
    popularSkills: ['Wiring & Rewiring', 'MCB Panel Repair', 'Fan Installation', 'Socket Replacement', 'Short Circuit Fix'],
  },
  {
    name: 'AC Technician',
    slug: 'ac-technician',
    description: 'Air-conditioner installation, gas top-up, filter cleaning, PCB repair and annual maintenance.',
    iconKey: 'Wind',
    coverImage: '/images/categories/ac-technician.webp',
    startingPrice: 399,
    popularSkills: ['AC Installation', 'Gas Refill', 'Filter Deep Clean', 'PCB Repair', 'Annual AMC'],
  },
  {
    name: 'Carpenter',
    slug: 'carpenter',
    description: 'Custom furniture making, door and window repairs, modular wardrobe fitting and polish work.',
    iconKey: 'Hammer',
    coverImage: '/images/categories/carpenter.webp',
    startingPrice: 349,
    popularSkills: ['Furniture Repair', 'Door Fitting', 'Modular Wardrobe', 'Polish & Laminate', 'False Ceiling'],
  },
  {
    name: 'Painter',
    slug: 'painter',
    description: 'Interior and exterior painting, texture coating, waterproofing and wall putty finishing.',
    iconKey: 'Paintbrush',
    coverImage: '/images/categories/painter.webp',
    startingPrice: 299,
    popularSkills: ['Interior Emulsion', 'Exterior Weather Coat', 'Texture Paint', 'Wall Putty', 'Waterproofing'],
  },
  {
    name: 'Cleaner',
    slug: 'cleaner',
    description: 'Deep cleaning for homes and offices: bathroom, kitchen, sofa, carpet and post-construction.',
    iconKey: 'Sparkles',
    coverImage: '/images/categories/cleaner.webp',
    startingPrice: 299,
    popularSkills: ['Bathroom Deep Clean', 'Kitchen Degreasing', 'Sofa Steam Clean', 'Post-Construction', 'Office Sanitisation'],
  },
  {
    name: 'Appliance Repair',
    slug: 'appliance-repair',
    description: 'On-site repair for washing machines, refrigerators, microwaves, geysers and water purifiers.',
    iconKey: 'Settings',
    coverImage: '/images/categories/appliance-repair.webp',
    startingPrice: 299,
    popularSkills: ['Washing Machine Repair', 'Refrigerator Service', 'Microwave Fix', 'Geyser Repair', 'Water Purifier'],
  },
  {
    name: 'CCTV & Security',
    slug: 'cctv-security',
    description: 'CCTV camera installation and configuration, DVR setup, video door phones and alarm systems.',
    iconKey: 'Camera',
    coverImage: '/images/categories/cctv-security.webp',
    startingPrice: 499,
    popularSkills: ['Camera Installation', 'DVR/NVR Setup', 'Network Config', 'Video Door Phone', 'Alarm System'],
  },
  {
    name: 'Pest Control',
    slug: 'pest-control',
    description: 'General pest control, anti-termite treatment, cockroach spray and rodent management.',
    iconKey: 'Bug',
    coverImage: '/images/categories/pest-control.webp',
    startingPrice: 599,
    popularSkills: ['General Pest Control', 'Anti-Termite', 'Cockroach Treatment', 'Rodent Management', 'Bedbug Treatment'],
  },
  {
    name: 'Water Purifier',
    slug: 'water-purifier',
    description: 'RO and UV water purifier installation, annual maintenance, filter replacement and repair.',
    iconKey: 'Droplets',
    coverImage: '/images/categories/water-purifier.webp',
    startingPrice: 299,
    popularSkills: ['RO Installation', 'Filter Replacement', 'UV Repair', 'TDS Calibration', 'Annual Service'],
  },
];

// 32 Tricity area nodes (Chandigarh 12, Mohali 12, Panchkula 8)
const TRICITY_AREAS = [
  // Chandigarh (12)
  { name: 'Sector 17, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7373, lng: 76.7881 } },
  { name: 'Sector 22, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7352, lng: 76.7975 } },
  { name: 'Sector 35, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7271, lng: 76.7692 } },
  { name: 'Sector 43, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7132, lng: 76.7643 } },
  { name: 'Sector 8, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7456, lng: 76.7952 } },
  { name: 'Sector 15, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7521, lng: 76.7684 } },
  { name: 'Sector 26, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7291, lng: 76.8112 } },
  { name: 'Sector 34, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7214, lng: 76.7711 } },
  { name: 'Sector 46, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7021, lng: 76.7645 } },
  { name: 'Sector 20, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7210, lng: 76.7865 } },
  { name: 'Sector 38, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7432, lng: 76.7410 } },
  { name: 'Mani Majra, Chandigarh', region: 'Chandigarh', coordinates: { lat: 30.7231, lng: 76.8456 } },

  // Mohali (12)
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

  // Panchkula (8)
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
  ['Sector 17, Chandigarh', 'Sector 22, Chandigarh', 1.8],
  ['Sector 22, Chandigarh', 'Sector 35, Chandigarh', 2.1],
  ['Sector 35, Chandigarh', 'Sector 43, Chandigarh', 2.4],
  ['Sector 17, Chandigarh', 'Sector 8, Chandigarh', 2.0],
  ['Sector 17, Chandigarh', 'Sector 15, Chandigarh', 2.2],
  ['Sector 8, Chandigarh', 'Sector 26, Chandigarh', 2.6],
  ['Sector 22, Chandigarh', 'Sector 20, Chandigarh', 2.1],
  ['Sector 35, Chandigarh', 'Sector 34, Chandigarh', 1.9],
  ['Sector 34, Chandigarh', 'Sector 46, Chandigarh', 2.5],
  ['Sector 43, Chandigarh', 'Sector 46, Chandigarh', 2.8],
  ['Sector 15, Chandigarh', 'Sector 38, Chandigarh', 2.7],
  ['Sector 26, Chandigarh', 'Mani Majra, Chandigarh', 3.8],
  ['Phase 1, Mohali', 'Phase 5, Mohali', 2.3],
  ['Phase 5, Mohali', 'Phase 3B2, Mohali', 1.6],
  ['Phase 3B2, Mohali', 'Phase 7, Mohali', 1.4],
  ['Phase 7, Mohali', 'Sector 70, Mohali', 1.8],
  ['Sector 70, Mohali', 'Sector 71, Mohali', 1.5],
  ['Phase 7, Mohali', 'Phase 10, Mohali', 2.4],
  ['Phase 10, Mohali', 'Phase 11, Mohali', 1.5],
  ['Sector 70, Mohali', 'Sector 68, Mohali', 1.9],
  ['Sector 68, Mohali', 'Sector 79, Mohali', 2.2],
  ['Sector 79, Mohali', 'Sector 82, Mohali', 3.2],
  ['Phase 5, Mohali', 'Kharar Road, Mohali', 4.5],
  ['Sector 5, Panchkula', 'Sector 7, Panchkula', 1.2],
  ['Sector 7, Panchkula', 'Sector 11, Panchkula', 1.5],
  ['Sector 11, Panchkula', 'Sector 14, Panchkula', 1.3],
  ['Sector 14, Panchkula', 'Sector 20, Panchkula', 2.1],
  ['Sector 5, Panchkula', 'Sector 4, Panchkula', 1.4],
  ['Sector 5, Panchkula', 'MDC Sector 4, Panchkula', 2.8],
  ['Sector 14, Panchkula', 'Industrial Area, Panchkula', 1.9],
  ['Sector 43, Chandigarh', 'Phase 7, Mohali', 3.2],
  ['Sector 35, Chandigarh', 'Phase 3B2, Mohali', 3.8],
  ['Sector 38, Chandigarh', 'Phase 1, Mohali', 3.1],
  ['Sector 46, Chandigarh', 'Phase 10, Mohali', 3.6],
  ['Mani Majra, Chandigarh', 'MDC Sector 4, Panchkula', 2.4],
  ['Sector 26, Chandigarh', 'Sector 5, Panchkula', 5.2],
  ['Sector 20, Chandigarh', 'Sector 7, Panchkula', 6.0],
  ['Phase 11, Mohali', 'Sector 20, Panchkula', 7.5],
];

// 70 Unique Indian Provider Names (7 per trade × 10 trades)
const UNIQUE_PROVIDER_NAMES = [
  { name: 'Rajesh Sharma', gender: 'male' },    // index 0 — demo provider
  { name: 'Manpreet Singh', gender: 'male' },
  { name: 'Aman Verma', gender: 'male' },
  { name: 'Kuldeep Saini', gender: 'male' },
  { name: 'Suresh Kumar', gender: 'male' },
  { name: 'Sunita Devi', gender: 'female' },
  { name: 'Ravi Bhardwaj', gender: 'male' },
  { name: 'Deepak Chauhan', gender: 'male' },
  { name: 'Pooja Rani', gender: 'female' },
  { name: 'Vikram Thakur', gender: 'male' },
  { name: 'Harpreet Kaur', gender: 'female' },
  { name: 'Sunil Panchal', gender: 'male' },
  { name: 'Arun Yadav', gender: 'male' },
  { name: 'Rekha Sharma', gender: 'female' },
  { name: 'Pankaj Mishra', gender: 'male' },
  { name: 'Jaswinder Singh', gender: 'male' },
  { name: 'Gurpreet Singh', gender: 'male' },
  { name: 'Anita Verma', gender: 'female' },
  { name: 'Sanjay Rawat', gender: 'male' },
  { name: 'Mukesh Kashyap', gender: 'male' },
  { name: 'Priya Saini', gender: 'female' },
  { name: 'Rakesh Dhiman', gender: 'male' },
  { name: 'Rohit Pandey', gender: 'male' },
  { name: 'Neha Gupta', gender: 'female' },
  { name: 'Dharmendra Yadav', gender: 'male' },
  { name: 'Manoj Kumar', gender: 'male' },
  { name: 'Ashok Sharma', gender: 'male' },
  { name: 'Suraj Bhan', gender: 'male' },
  { name: 'Satish Chand', gender: 'male' },
  { name: 'Balwinder Singh', gender: 'male' },
  { name: 'Jagdish Prasad', gender: 'male' },
  { name: 'Naveen Joshi', gender: 'male' },
  { name: 'Anil Garg', gender: 'male' },
  { name: 'Amit Singla', gender: 'male' },
  { name: 'Devender Negi', gender: 'male' },
  { name: 'Paramjit Singh', gender: 'male' },
  { name: 'Gaurav Mittal', gender: 'male' },
  { name: 'Tarun Bansal', gender: 'male' },
  { name: 'Simranjeet Kaur', gender: 'female' },
  { name: 'Kavita Chawla', gender: 'female' },
  { name: 'Virender Gill', gender: 'male' },
  { name: 'Inderjit Sidhu', gender: 'male' },
  { name: 'Bikramjit Sandhu', gender: 'male' },
  { name: 'Geeta Rani', gender: 'female' },
  { name: 'Joginder Pal', gender: 'male' },
  { name: 'Sarabjit Dhillon', gender: 'male' },
  { name: 'Manish Tyagi', gender: 'male' },
  { name: 'Meena Kumari', gender: 'female' },
  { name: 'Hemant Goel', gender: 'male' },
  { name: 'Bhupinder Brar', gender: 'male' },
  { name: 'Jaswant Khatri', gender: 'male' },
  { name: 'Saroj Bala', gender: 'female' },
  { name: 'Subhash Chander', gender: 'male' },
  { name: 'Kamal Nayan', gender: 'male' },
  { name: 'Raman Deep', gender: 'male' },
  { name: 'Jyoti Sharma', gender: 'female' },
  { name: 'Mohan Lal', gender: 'male' },
  { name: 'Satnam Randhawa', gender: 'male' },
  { name: 'Tejinder Bawa', gender: 'male' },
  { name: 'Suman Lata', gender: 'female' },
  { name: 'Chander Prakash', gender: 'male' },
  { name: 'Naresh Sethi', gender: 'male' },
  { name: 'Gurcharan Aulakh', gender: 'male' },
  { name: 'Rajinder Bassi', gender: 'male' },
  { name: 'Anju Bala', gender: 'female' },
  { name: 'Satpal Narang', gender: 'male' },
  { name: 'Trilochan Cheema', gender: 'male' },
  { name: 'Vijay Anand', gender: 'male' },
  { name: 'Ritu Aggarwal', gender: 'female' },
  { name: 'Davinder Sohal', gender: 'male' },
];

const CUSTOMER_REVIEW_COMMENTS = [
  'Came right on time. Diagnosed the leak within 10 minutes and replaced the damaged brass elbow cleanly. Fair charges.',
  'Very polite technician. Brought all spare parts in his kit and explained the electrical load balancing well. Recommended.',
  'Serviced our split AC before peak heat started. Cooling performance improved dramatically and gas pressure was tested properly.',
  'Arrived quickly for an urgent problem. Very neat with work, did not leave any debris behind. Will book again.',
  'Decent work on the door locks. A bit delayed by 20 minutes due to rain traffic, but did a thorough job once he arrived.',
  'Solid professional. Charged exactly the visit fee shown upfront, no unexpected extras. Good neighbourly experience.',
  'Fixed our washing machine drain sensor. Cleaned up the utility balcony after finishing. 5 stars.',
  'Excellent wall putty finish in the living room. Smooth surface, neat edges around the switchboards.',
  'Cleared a stubborn kitchen drain that had been blocked for two days. Brought high-pressure equipment and resolved it smoothly.',
  'Replaced our RO carbon filters and calibrated TDS down from 480 to 95. Clean, professional work.',
];

export const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB. Clearing existing collections...');

    await Promise.all([
      User.deleteMany(),
      ProviderProfile.deleteMany(),
      ServiceCategory.deleteMany(),
      Booking.deleteMany(),
      Review.deleteMany(),
      Payment.deleteMany(),
      Complaint.deleteMany(),
      Notification.deleteMany(),
      AreaGraphModel.deleteMany(),
    ]);

    console.log('1. Seeding 10 Service Categories...');
    await ServiceCategory.insertMany(CATEGORIES);

    console.log('2. Seeding 32 Area Graph Nodes and Road Network...');
    const areaGraphDocs = TRICITY_AREAS.map((area) => {
      const edges = [];
      for (const [u, v, dist] of ROAD_EDGES) {
        if (u === area.name) edges.push({ to: v, distanceKm: dist });
        else if (v === area.name) edges.push({ to: u, distanceKm: dist });
      }
      return {
        name: area.name,
        region: area.region,
        coordinates: area.coordinates,
        edges,
      };
    });
    await AreaGraphModel.insertMany(areaGraphDocs);

    console.log('3. Creating Demo Accounts...');
    const salt = await bcrypt.genSalt(10);
    const customerHash = await bcrypt.hash('CustomerPass123!', salt);
    const providerHash = await bcrypt.hash('ProviderPass123!', salt);
    const adminHash = await bcrypt.hash('AdminPass123!', salt);

    // Demo Customer
    const demoCustomer = await User.create({
      name: 'Arjun Mehra',
      email: 'arjun.customer@nearfix.in',
      phone: '9815012345',
      passwordHash: customerHash,
      role: 'customer',
      status: 'active',
      avatar: getProviderAvatar('Arjun Mehra', 1),
      neighbourhood: 'Phase 7, Mohali',
      address: 'House #1428, Phase 7, Near Rose Garden, Mohali',
    });

    // Demo Provider (index 0 = Rajesh Sharma)
    const demoProviderUser = await User.create({
      name: 'Rajesh Sharma',
      email: 'rajesh.electric@nearfix.in',
      phone: '9876543210',
      passwordHash: providerHash,
      role: 'provider',
      status: 'active',
      avatar: getProviderAvatar('Rajesh Sharma', 1),
      neighbourhood: 'Sector 35, Chandigarh',
      address: 'SCO 214, Sector 35-C, Chandigarh',
    });

    const demoProviderProfile = await ProviderProfile.create({
      user: demoProviderUser._id,
      headline: 'Master Electrician & Short Circuit Specialist (12+ Yrs)',
      bio: 'Licensed electrical technician handling domestic rewiring, modular switchboard installations, MCB balancing, and emergency power restoration across Chandigarh and Mohali.',
      categories: ['electrician', 'appliance-repair'],
      skills: ['Short Circuit Repair', 'MCB Switchboard Fix', 'Ceiling Fan Installation', 'Inverter Wiring', 'Heavy Appliance Lines'],
      experienceYears: 12,
      serviceAreas: ['Sector 35, Chandigarh', 'Sector 22, Chandigarh', 'Phase 7, Mohali', 'Sector 43, Chandigarh'],
      location: { type: 'Point', coordinates: [76.7562, 30.7225] },
      pricing: { visitCharge: 350, hourlyRate: 250 },
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        hours: '8:00 AM - 9:00 PM',
        isAvailableNow: true,
      },
      verificationStatus: 'verified',
      ratingAverage: 4.9,
      ratingCount: 38,
      earningsTotal: 48500,
      photos: [getProviderAvatar('Rajesh Sharma', 1)],
    });

    // Demo Admin
    await User.create({
      name: 'Simran Kaur',
      email: 'admin@nearfix.in',
      phone: '9888099999',
      passwordHash: adminHash,
      role: 'admin',
      status: 'active',
      avatar: getProviderAvatar('Simran Kaur', 2),
      neighbourhood: 'Sector 17, Chandigarh',
    });

    console.log('4. Creating 7 sample customers...');
    const customerUserIds = [demoCustomer._id];
    const sampleCustomers = [
      { name: 'Preet Kaur', area: 'Sector 22, Chandigarh' },
      { name: 'Rohit Jain', area: 'Phase 5, Mohali' },
      { name: 'Meena Batra', area: 'Sector 7, Panchkula' },
      { name: 'Sukhwinder Gill', area: 'Sector 70, Mohali' },
      { name: 'Anjali Nanda', area: 'Sector 35, Chandigarh' },
      { name: 'Harish Monga', area: 'Sector 11, Panchkula' },
    ];
    for (let i = 0; i < sampleCustomers.length; i++) {
      const c = sampleCustomers[i];
      const custUser = await User.create({
        name: c.name,
        email: `customer.${i + 1}@nearfix.in`,
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash: customerHash,
        role: 'customer',
        status: 'active',
        avatar: getProviderAvatar(c.name, 80 + i),
        neighbourhood: c.area,
        address: `House #${100 + i * 14}, ${c.area}`,
      });
      customerUserIds.push(custUser._id);
    }

    console.log('5. Generating 70 providers (7 per trade)...');
    const allProviders = [demoProviderProfile];
    // Index 1 is Manpreet Singh — start from index 1 since index 0 is Rajesh (demo)
    let nameIdx = 1;

    for (let catIdx = 0; catIdx < CATEGORIES.length; catIdx++) {
      const primaryCategory = CATEGORIES[catIdx];
      for (let j = 0; j < 7; j++) {
        const providerData = UNIQUE_PROVIDER_NAMES[nameIdx] || { name: `Technician ${nameIdx}`, gender: 'male' };
        nameIdx++;

        const area = TRICITY_AREAS[(catIdx * 7 + j) % TRICITY_AREAS.length];
        const nearbyArea = TRICITY_AREAS[(catIdx * 7 + j + 1) % TRICITY_AREAS.length];
        const avatarUrl = getProviderAvatar(providerData.name, nameIdx);
        const exp = 3 + (j * 2);
        const visitCharge = primaryCategory.startingPrice + j * 50;

        const pUser = await User.create({
          name: providerData.name,
          email: `pro.${providerData.name.toLowerCase().replace(/[^a-z]/g, '')}.${nameIdx}@nearfix.in`,
          phone: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
          passwordHash: providerHash,
          role: 'provider',
          status: 'active',
          avatar: avatarUrl,
          neighbourhood: area.name,
          address: `SCO #${20 + nameIdx % 80}, ${area.name}`,
        });

        const profile = await ProviderProfile.create({
          user: pUser._id,
          headline: `${primaryCategory.name} Specialist (${exp} Yrs Exp)`,
          bio: `Trusted local ${primaryCategory.name.toLowerCase()} in ${area.name}. Prompt service, clean workmanship, upfront quotes.`,
          categories: [primaryCategory.slug],
          skills: primaryCategory.popularSkills.slice(0, 3 + (j % 3)),
          experienceYears: exp,
          serviceAreas: [area.name, nearbyArea.name],
          location: {
            type: 'Point',
            coordinates: [
              area.coordinates.lng + (Math.random() - 0.5) * 0.01,
              area.coordinates.lat + (Math.random() - 0.5) * 0.01,
            ],
          },
          pricing: {
            visitCharge,
            hourlyRate: Math.round(visitCharge * 0.7),
          },
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            hours: '8:30 AM - 8:30 PM',
            isAvailableNow: j % 4 !== 0,
          },
          verificationStatus: j === 6 ? 'pending' : 'verified',
          ratingAverage: Math.min(5.0, 4.0 + j * 0.1),
          ratingCount: 5 + j * 3,
          earningsTotal: (8 + j * 2) * visitCharge,
          photos: [avatarUrl],
        });

        allProviders.push(profile);
      }
    }

    console.log('6. Generating ~49 Bookings...');
    const bookingStatuses = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'];
    const bookings = [];

    for (let i = 0; i < 49; i++) {
      const customerId = customerUserIds[i % customerUserIds.length];
      const provider = allProviders[i % allProviders.length];
      const isEmergency = i % 7 === 0;
      const status = i < 35 ? 'completed' : bookingStatuses[i % bookingStatuses.length];
      const categorySlug = provider.categories[0];
      const categoryObj = CATEGORIES.find((c) => c.slug === categorySlug) || CATEGORIES[0];
      const area = TRICITY_AREAS[i % TRICITY_AREAS.length];

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - (i % 30));

      const booking = await Booking.create({
        customer: customerId,
        provider: provider._id,
        category: categorySlug,
        serviceName: `${categoryObj.name} Service`,
        address: `House #${120 + i}, ${area.name}`,
        neighbourhood: area.name,
        urgency: isEmergency ? 'emergency' : 'normal',
        scheduledFor: scheduledDate,
        problemDescription: isEmergency
          ? 'Urgent emergency repair needed immediately.'
          : 'Standard servicing and diagnosis requested.',
        price: provider.pricing.visitCharge,
        status,
        paymentStatus: status === 'completed' ? 'paid' : 'pending',
        hasReview: status === 'completed' && i < 35,
        statusHistory: [
          { status: 'requested', timestamp: scheduledDate },
          { status, timestamp: scheduledDate },
        ],
      });

      bookings.push(booking);

      if (booking.paymentStatus === 'paid') {
        await Payment.create({
          booking: booking._id,
          customer: customerId,
          amount: booking.price,
          method: ['upi', 'card', 'netbanking'][i % 3],
          status: 'completed',
          reference: `PAY-SEED-${10000 + i}`,
          createdAt: scheduledDate,
        });
      }
    }

    console.log('7. Seeding ~35 Reviews...');
    for (let i = 0; i < 35; i++) {
      const b = bookings[i];
      if (b && b.status === 'completed') {
        await Review.create({
          booking: b._id,
          customer: b.customer,
          provider: b.provider,
          rating: i % 15 === 0 ? 3 : 4 + (i % 2),
          comment: CUSTOMER_REVIEW_COMMENTS[i % CUSTOMER_REVIEW_COMMENTS.length],
          createdAt: b.scheduledFor,
        });
      }
    }

    console.log('8. Seeding Complaints and Notifications...');
    await Complaint.create({
      raisedBy: customerUserIds[1],
      against: allProviders[5].user,
      booking: bookings[5]._id,
      subject: 'Technician arrived 45 minutes late without notice',
      description: 'The booking was set for 11 AM, but provider reached at 11:45 AM due to prior job overrun.',
      status: 'under_review',
      adminNote: 'Contacted provider to reiterate strict scheduling notice rules.',
    });

    await Notification.create({
      user: demoCustomer._id,
      title: 'Booking Confirmed',
      body: 'Your AC Repair service is scheduled for tomorrow at 10:00 AM.',
      link: '/customer/bookings',
    });
    await Notification.create({
      user: demoProviderUser._id,
      title: 'New Booking Request',
      body: 'Customer in Phase 7, Mohali has requested Electrician Service.',
      link: '/provider/dashboard',
    });

    console.log('----------------------------------------------------');
    console.log('NearFix Database Seeded Successfully!');
    console.log('- 10 Service Categories');
    console.log('- 32 Area Graph Nodes (Mohali, Chandigarh, Panchkula)');
    console.log('- 71 Providers (demo + 7 per trade × 10 trades)');
    console.log('- 7 Sample Customers');
    console.log('- ~49 Bookings');
    console.log('- ~35 Customer Reviews');
    console.log('Demo Credentials (dev only):');
    console.log('  Customer: arjun.customer@nearfix.in / CustomerPass123!');
    console.log('  Provider: rajesh.electric@nearfix.in / ProviderPass123!');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
