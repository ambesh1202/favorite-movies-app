const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/entriesController');

/**
 * Create entry (auth)
 */
router.post('/', authenticate, ctrl.createEntry);

/**
 * List entries (public shows approved only; ?mine=true shows user's)
 */
router.get('/', ctrl.listEntries);

/**
 * Get single entry — note: pending visible only to owner/admin
 */
router.get('/:id', authenticate, ctrl.getEntry);

/**
 * Update (owner or admin)
 */
router.patch('/:id', authenticate, ctrl.updateEntry);

/**
 * Delete (soft delete) - owner or admin
 */
router.delete('/:id', authenticate, ctrl.deleteEntry);

/**
 * Admin approve/reject
 */
router.post('/:id/approve', authenticate, authorize(['ADMIN']), ctrl.approveEntry);

module.exports = router;
