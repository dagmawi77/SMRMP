const authRoutes = require('./authRoutes');
const artifactRoutes = require('./artifactRoutes');
const exhibitionRoutes = require('./exhibitionRoutes');
const conservationRoutes = require('./conservationRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const ticketRoutes = require('./ticketRoutes');
const aiRoutes = require('./aiRoutes');

const router = require('express').Router();

router.use('/auth', authRoutes);
router.use('/artifacts', artifactRoutes);
router.use('/exhibitions', exhibitionRoutes);
router.use('/conservation', conservationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tickets', ticketRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
