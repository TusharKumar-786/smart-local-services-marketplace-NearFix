import dotenv from 'dotenv';
dotenv.config();

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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nearfix';

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
    description: 'Fast switchboard repairs, short circuit fixes, fan fittings and full house rewiring.',
    iconKey: 'Zap',
    coverImage: '/images/categories/electrician.webp',
    startingPrice: 299,
    popularSkills: ['Short Circuit Repair', 'MCB Switchboard Fix', 'Ceiling Fan Installation', 'Inverter Wiring', 'Appliance Power Points'],
  },
  {
    name: 'AC Repair',
    slug: 'ac-repair',
    description: 'Deep foam jet servicing, gas charging, cooling diagnosis and PCB board repair.',
    iconKey: 'Wind',
    coverImage: '/images/categories/ac-repair.webp',
    startingPrice: 499,
    popularSkills: ['Foam Jet Servicing', 'Gas Leakage Fix', 'Compressor Check', 'AC Installation & Uninstallation', 'Cooling Coil Cleaning'],
  },
  {
    name: 'Painter',
    slug: 'painter',
    description: 'Interior and exterior wall painting, waterproof putty application, texture and trim work.',
    iconKey: 'Paintbrush',
    coverImage: '/images/categories/painter.webp',
    startingPrice: 599,
    popularSkills: ['Interior Emulsion', 'Waterproofing & Putty', 'Texture Wall Design', 'Wood Polish', 'Exterior Weathercoat'],
  },
  {
    name: 'Carpenter',
    slug: 'carpenter',
    description: 'Door lock replacements, hinge repairs, modular wardrobe assembly and furniture fixing.',
    iconKey: 'Hammer',
    coverImage: '/images/categories/carpenter.webp',
    startingPrice: 399,
    popularSkills: ['Door Lock & Hinge Fix', 'Modular Furniture Assembly', 'Drawer Channel Repair', 'Wooden Partition Work', 'Window Frame Adjustment'],
  },
  {
    name: 'Home Cleaning',
    slug: 'home-cleaning',
    description: 'Deep bathroom scrubbing, kitchen de-greasing, sofa shampooing and full home sanitization.',
    iconKey: 'Sparkles',
    coverImage: '/images/categories/home-cleaning.webp',
    startingPrice: 799,
    popularSkills: ['Deep Bathroom Scrubbing', 'Kitchen Chimney & Tile Degreasing', 'Sofa & Mattress Shampooing', 'Balcony & Floor Scrubbing', 'Full Villa Deep Clean'],
  },
  {
    name: 'Appliance Repair',
    slug: 'appliance-repair',
    description: 'Washing machine drum repair, refrigerator cooling diagnosis, microwave and RO servicing.',
    iconKey: 'Tool',
    coverImage: '/images/categories/appliance-repair.webp',
    startingPrice: 349,
    popularSkills: ['Washing Machine Drum Fix', 'Refrigerator Thermostat & Gas', 'Microwave Magnetron Check', 'Mixer Grinder Motor Fix', 'Dishwasher Maintenance'],
  },
  {
    name: 'Pest Control',
    slug: 'pest-control',
    description: 'Herbal gel treatment for cockroaches, anti-termite piping treatment and bed bug eradication.',
    iconKey: 'ShieldAlert',
    coverImage: '/images/categories/pest-control.webp',
    startingPrice: 649,
    popularSkills: ['Cockroach Herbal Gel', 'Anti-Termite Drilling', 'Bed Bug Heat Treatment', 'Mosquito Fogging', 'Rodent Baiting'],
  },
  {
    name: 'Water Purifier Service',
    slug: 'water-purifier',
    description: 'RO membrane replacement, sediment carbon filter change, TDS check and booster pump repair.',
    iconKey: 'Droplets',
    coverImage: '/images/categories/water-purifier.webp',
    startingPrice: 399,
    popularSkills: ['RO Filter Replacement', 'TDS Level Adjustment', 'Booster Pump Replacement', 'UV Lamp Fix', 'Water Leakage Clearance'],
  },
  {
    name: 'CCTV and Wi-Fi Setup',
    slug: 'cctv-wifi',
    description: 'IP camera installation, DVR/NVR configuration, mesh Wi-Fi setup and optical fibre cabling.',
    iconKey: 'Wifi',
    coverImage: '/images/categories/cctv-wifi.webp',
    startingPrice: 499,
    popularSkills: ['Dome & Bullet Camera Fitting', 'NVR/DVR Network Config', 'Mesh Wi-Fi Router Range Setup', 'LAN & Fibre Patch Cabling', 'Mobile Remote View Sync'],
  },
];

// 2. 32 Tricity Area Nodes (Mohali, Chandigarh, Panchkula) with realistic road edges
const TRICITY_AREAS = [
  // Chandigarh (12)
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

// Connected road corridors between areas
const ROAD_EDGES = [
  // Chandigarh internal
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

  // Mohali internal
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

  // Panchkula internal
  ['Sector 5, Panchkula', 'Sector 7, Panchkula', 1.2],
  ['Sector 7, Panchkula', 'Sector 11, Panchkula', 1.5],
  ['Sector 11, Panchkula', 'Sector 14, Panchkula', 1.3],
  ['Sector 14, Panchkula', 'Sector 20, Panchkula', 2.1],
  ['Sector 5, Panchkula', 'Sector 4, Panchkula', 1.4],
  ['Sector 5, Panchkula', 'MDC Sector 4, Panchkula', 2.8],
  ['Sector 14, Panchkula', 'Industrial Area, Panchkula', 1.9],

  // Inter-city cross bridges (Chandigarh - Mohali - Panchkula)
  ['Sector 43, Chandigarh', 'Phase 7, Mohali', 3.2],
  ['Sector 35, Chandigarh', 'Phase 3B2, Mohali', 3.8],
  ['Sector 38, Chandigarh', 'Phase 1, Mohali', 3.1],
  ['Sector 46, Chandigarh', 'Phase 10, Mohali', 3.6],
  ['Mani Majra, Chandigarh', 'MDC Sector 4, Panchkula', 2.4],
  ['Sector 26, Chandigarh', 'Sector 5, Panchkula', 5.2],
  ['Sector 20, Chandigarh', 'Sector 7, Panchkula', 6.0],
  ['Phase 11, Mohali', 'Sector 20, Panchkula', 7.5],
];

// Realistic Indian technician pool data
const INDIAN_FIRST_NAMES = [
  'Rajesh', 'Aman', 'Suresh', 'Manpreet', 'Harpreet', 'Ravi', 'Deepak', 'Vikram',
  'Sunil', 'Arun', 'Pankaj', 'Kuldeep', 'Jaswinder', 'Gurpreet', 'Sanjay', 'Mukesh',
  'Rakesh', 'Rohit', 'Dharmendra', 'Manoj', 'Ashok', 'Suraj', 'Satish', 'Balwinder',
  'Jagdish', 'Naveen', 'Anil', 'Amit', 'Devender', 'Paramjit', 'Gaurav', 'Tarun'
];

const INDIAN_LAST_NAMES = [
  'Kumar', 'Singh', 'Verma', 'Sharma', 'Gupta', 'Saini', 'Bhardwaj', 'Chauhan',
  'Mishra', 'Yadav', 'Pandey', 'Dhiman', 'Thakur', 'Kashyap', 'Rawat', 'Panchal'
];

const REAL_PORTRAITS = [
  'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
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
  'Replaced our RO carbon filters and calibrated TDS down from 480 to 95. Clean, professional work.'
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
      // Find all edges connected to this area
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

    console.log('3. Creating 3 Official Demo Accounts...');
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
      avatar: REAL_PORTRAITS[0],
      neighbourhood: 'Phase 7, Mohali',
      address: 'House #1428, Phase 7, Near Rose Garden, Mohali',
    });

    // Demo Provider
    const demoProviderUser = await User.create({
      name: 'Rajesh Sharma',
      email: 'rajesh.electric@nearfix.in',
      phone: '9876543210',
      passwordHash: providerHash,
      role: 'provider',
      status: 'active',
      avatar: REAL_PORTRAITS[1],
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
      photos: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      ],
    });

    // Demo Admin
    await User.create({
      name: 'Simran Kaur',
      email: 'admin@nearfix.in',
      phone: '9888099999',
      passwordHash: adminHash,
      role: 'admin',
      status: 'active',
      avatar: REAL_PORTRAITS[4],
      neighbourhood: 'Sector 17, Chandigarh',
    });

    console.log('4. Generating 140+ Authentic Tradespeople across Tricity...');
    const allProviders = [demoProviderProfile];
    const customerUserIds = [demoCustomer._id];

    // Seed 40 customer accounts for realistic reviews
    for (let i = 0; i < 40; i++) {
      const fName = INDIAN_FIRST_NAMES[i % INDIAN_FIRST_NAMES.length];
      const lName = INDIAN_LAST_NAMES[(i * 3) % INDIAN_LAST_NAMES.length];
      const area = TRICITY_AREAS[i % TRICITY_AREAS.length];
      const custUser = await User.create({
        name: `${fName} ${lName}`,
        email: `customer.${fName.toLowerCase()}.${i + 1}@nearfix.in`,
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash: customerHash,
        role: 'customer',
        status: 'active',
        avatar: REAL_PORTRAITS[i % REAL_PORTRAITS.length],
        neighbourhood: area.name,
        address: `House #${100 + i * 14}, ${area.name}`,
      });
      customerUserIds.push(custUser._id);
    }

    // Seed 140 providers
    for (let i = 0; i < 140; i++) {
      const fName = INDIAN_FIRST_NAMES[(i * 2 + 5) % INDIAN_FIRST_NAMES.length];
      const lName = INDIAN_LAST_NAMES[(i * 5 + 2) % INDIAN_LAST_NAMES.length];
      const category = CATEGORIES[i % CATEGORIES.length];
      const secondaryCategory = CATEGORIES[(i + 3) % CATEGORIES.length];
      const area = TRICITY_AREAS[i % TRICITY_AREAS.length];
      const nearbyArea = TRICITY_AREAS[(i + 1) % TRICITY_AREAS.length];

      const pUser = await User.create({
        name: `${fName} ${lName}`,
        email: `pro.${fName.toLowerCase()}.${i + 1}@nearfix.in`,
        phone: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash: providerHash,
        role: 'provider',
        status: i === 138 ? 'blocked' : 'active', // 1 blocked for admin moderation demo
        avatar: REAL_PORTRAITS[i % REAL_PORTRAITS.length],
        neighbourhood: area.name,
        address: `SCO #${20 + (i % 80)}, ${area.name}`,
      });

      const exp = 3 + (i % 18);
      const rating = Math.round((4.0 + (i % 11) * 0.1) * 10) / 10;
      const visitCharge = category.startingPrice + (i % 4) * 50;

      const profile = await ProviderProfile.create({
        user: pUser._id,
        headline: `${category.name} & Repair Specialist (${exp} Yrs Exp)`,
        bio: `Trusted local service professional in ${area.name}. Providing prompt turnaround, clean workmanship, and genuine spare parts.`,
        categories: [category.slug, secondaryCategory.slug],
        skills: category.popularSkills.slice(0, 3 + (i % 3)),
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
          isAvailableNow: i % 4 !== 0, // ~75% currently available
        },
        verificationStatus: i === 139 ? 'pending' : 'verified', // 1 pending for admin verification test
        ratingAverage: Math.min(5.0, rating),
        ratingCount: 8 + (i % 45),
        earningsTotal: (12 + (i % 30)) * visitCharge,
        photos: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        ],
      });

      allProviders.push(profile);
    }

    console.log('5. Generating 320+ Bookings across various statuses...');
    const bookingStatuses = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'];
    const bookings = [];

    for (let i = 0; i < 330; i++) {
      const customerId = customerUserIds[i % customerUserIds.length];
      const provider = allProviders[i % allProviders.length];
      const isEmergency = i % 7 === 0;
      const status = i < 220 ? 'completed' : bookingStatuses[i % bookingStatuses.length];
      const categorySlug = provider.categories[0];
      const categoryObj = CATEGORIES.find((c) => c.slug === categorySlug) || CATEGORIES[0];
      const area = TRICITY_AREAS[i % TRICITY_AREAS.length];

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - (i % 45));

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
          ? 'Urgent emergency repair needed immediately. Facing water or electrical stoppage.'
          : 'Standard servicing and diagnosis requested.',
        price: provider.pricing.visitCharge,
        status,
        paymentStatus: status === 'completed' ? 'paid' : (i % 2 === 0 ? 'paid' : 'pending'),
        hasReview: status === 'completed' && i < 220,
        statusHistory: [
          { status: 'requested', timestamp: scheduledDate },
          { status: status, timestamp: scheduledDate },
        ],
      });

      bookings.push(booking);

      // Create Payment for paid bookings
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

    console.log('6. Seeding 210+ Authentic Customer Reviews...');
    for (let i = 0; i < 215; i++) {
      const b = bookings[i];
      if (b && b.status === 'completed') {
        const rating = 4 + (i % 2); // 4 or 5 mostly, occasional 3
        await Review.create({
          booking: b._id,
          customer: b.customer,
          provider: b.provider,
          rating: i % 15 === 0 ? 3 : rating,
          comment: CUSTOMER_REVIEW_COMMENTS[i % CUSTOMER_REVIEW_COMMENTS.length],
          createdAt: b.scheduledFor,
        });
      }
    }

    console.log('7. Seeding Complaints and Notifications...');
    // Seed 4 realistic complaints
    await Complaint.create({
      raisedBy: customerUserIds[1],
      against: allProviders[5].user,
      booking: bookings[225]._id,
      subject: 'Technician arrived 45 minutes late without notice',
      description: 'The booking was set for 11 AM, but provider reached at 11:45 AM due to prior job overrun.',
      status: 'under_review',
      adminNote: 'Contacted provider to reiterate strict scheduling notice rules.',
    });
    await Complaint.create({
      raisedBy: customerUserIds[2],
      against: allProviders[8].user,
      booking: bookings[226]._id,
      subject: 'Additional parts cost query',
      description: 'Wanted clarification on copper pipe charges for AC gas leak fix.',
      status: 'resolved',
      adminNote: 'Invoiced rate matched standard market price. Customer informed and satisfied.',
    });

    // Seed Notifications for Demo Customer
    await Notification.create({
      user: demoCustomer._id,
      title: 'Booking Confirmed',
      body: 'Your AC Repair service is scheduled for tomorrow at 10:00 AM.',
      link: '/customer/bookings',
    });
    await Notification.create({
      user: demoCustomer._id,
      title: 'Service Completed',
      body: 'Rajesh Sharma completed the Electrical Inspection. Please rate your experience.',
      link: '/customer/bookings',
    });

    // Seed Notification for Demo Provider
    await Notification.create({
      user: demoProviderUser._id,
      title: 'New Booking Request',
      body: 'Customer in Phase 7, Mohali has requested Electrician Service.',
      link: '/provider/bookings',
    });

    console.log('----------------------------------------------------');
    console.log('NearFix Database Seeded Successfully!');
    console.log(`- 10 Service Categories`);
    console.log(`- 32 Area Graph Nodes (Mohali, Chandigarh, Panchkula)`);
    console.log(`- 140+ Real Providers`);
    console.log(`- 320+ Bookings with History`);
    console.log(`- 210+ Customer Reviews`);
    console.log(`Demo Credentials:`);
    console.log(`  Customer: arjun.customer@nearfix.in / CustomerPass123!`);
    console.log(`  Provider: rajesh.electric@nearfix.in / ProviderPass123!`);
    console.log(`  Admin:    admin@nearfix.in / AdminPass123!`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
