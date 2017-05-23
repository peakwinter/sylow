import express from 'express';
import entityRoutes from './entity.route';
import documentRoutes from './document.route';
import authRoutes from './auth.route';
import clientRoutes from './client.route';

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

// mount clients routes at /clients
router.use('/clients', clientRoutes);

export default router;
