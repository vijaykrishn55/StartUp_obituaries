const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const assetController = require('../controllers/assetController');

// Create asset
router.post('/', protect, assetController.createAsset);

// Get all assets
router.get('/', assetController.getAssets);

// Get marketplace statistics
router.get('/stats', assetController.getMarketplaceStats);

// Get my assets
router.get('/my-assets', protect, assetController.getMyAssets);

// Get single asset
router.get('/:id', assetController.getAssetById);

// Update asset
router.put('/:id', protect, assetController.updateAsset);

// Delete asset
router.delete('/:id', protect, assetController.deleteAsset);

// Express interest
router.post('/:id/interest', protect, assetController.expressInterest);

// Mark as sold
router.post('/:id/sold', protect, assetController.markAsSold);

module.exports = router;
