import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

export const createApp = () => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    })
  );

  // Rate limiting for auth and search
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
  });
  app.use('/api', apiLimiter);

  // Strict rate limiting for auth endpoints (10 per 15 min)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many sign-in attempts. Please try again in 15 minutes.' },
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'NearFix Backend API',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/providers', providerRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error occurred',
    });
  });

  return app;
};
