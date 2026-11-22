import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { ProviderProfile } from '../models/ProviderProfile.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid 10-digit phone number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'provider', 'admin']).default('customer'),
  headline: z.string().optional(),
  categories: z.array(z.string()).optional(),
  neighbourhood: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'nearfix_super_secure_jwt_secret_key_2026';
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    secret,
    { expiresIn: '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role,
      neighbourhood: data.neighbourhood || 'Sector 17, Chandigarh',
    });

    let providerProfile = null;
    if (data.role === 'provider') {
      providerProfile = await ProviderProfile.create({
        user: user._id,
        headline: data.headline || `${data.name} - Skilled Technician`,
        bio: `Experienced local service professional dedicated to quality work and transparent pricing.`,
        categories: data.categories && data.categories.length > 0 ? data.categories : ['plumber'],
        skills: ['Diagnosis & Repair', 'Emergency Services'],
        serviceAreas: [data.neighbourhood || 'Sector 17, Chandigarh'],
        verificationStatus: 'verified', // Auto-verified for smooth local testing
        ratingAverage: 4.8,
        ratingCount: 1,
      });
    }

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        neighbourhood: user.neighbourhood,
      },
      providerProfile,
    });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'This account has been suspended by administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ProviderProfile.findOne({ user: user._id });
    }

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        neighbourhood: user.neighbourhood,
      },
      providerProfile,
    });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    return res.status(500).json({ message: 'Sign in failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    let providerProfile = null;
    if (req.user.role === 'provider') {
      providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    }

    return res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        avatar: req.user.avatar,
        neighbourhood: req.user.neighbourhood,
      },
      providerProfile,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, neighbourhood, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (neighbourhood) updates.neighbourhood = neighbourhood;
    if (avatar) updates.avatar = avatar;

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash');
    return res.json({ message: 'Profile updated', user: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Profile update failed' });
  }
};
