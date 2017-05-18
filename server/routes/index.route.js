import express from 'express';
import entityRoutes from './entity.route';
import documentRoutes from './document.route';
import authRoutes from './auth.route';
import deviceRoutes from './device.route';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount entity routes at /entities
router.use('/entities', entityRoutes);

// mount document routes at /documents
router.use('/documents', documentRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount devices routes at /devices
router.use('/devices', deviceRoutes);

export default router;
