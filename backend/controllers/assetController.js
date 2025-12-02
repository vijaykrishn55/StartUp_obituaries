const Asset = require('../models/Asset');

// Create new asset listing
exports.createAsset = async (req, res) => {
  try {
    // Validate required fields
    const { title, category, description, askingPrice } = req.body;
    
    if (!title || !category || !description || !askingPrice) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, category, description, and askingPrice are required' 
      });
    }

    if (askingPrice < 0) {
      return res.status(400).json({ message: 'Asking price must be a positive number' });
    }

    if (description.length < 50) {
      return res.status(400).json({ message: 'Description must be at least 50 characters long' });
    }

    const asset = new Asset({
      ...req.body,
      seller: req.user._id
    });

    await asset.save();
    await asset.populate('seller', 'name avatar company');
    
    res.status(201).json(asset);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(400).json({ message: error.message || 'Failed to create asset' });
  }
};

// Get all assets with filters
exports.getAssets = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      status = 'Available',
      search,
      page = 1,
      limit = 20
    } = req.query;

    const filter = { status };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.askingPrice = {};
      if (minPrice) filter.askingPrice.$gte = Number(minPrice);
      if (maxPrice) filter.askingPrice.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const assets = await Asset.find(filter)
      .populate('seller', 'name avatar company')
      .populate('failureReport', 'startupName industry')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Asset.countDocuments(filter);

    res.json({
      assets,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalAssets: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single asset
exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('seller', 'name avatar bio company email')
      .populate('failureReport', 'startupName industry detailedAnalysis')
      .populate('interested.user', 'name avatar')
      .populate('soldTo', 'name avatar');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Increment views
    asset.views += 1;
    await asset.save();

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update asset
exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(asset, req.body);
    await asset.save();

    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Express interest in asset
exports.expressInterest = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.status !== 'Available') {
      return res.status(400).json({ message: 'Asset is no longer available' });
    }

    // Prevent seller from expressing interest in their own asset
    if (asset.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot express interest in your own asset' });
    }

    const existingInterest = asset.interested.find(
      i => i.user.toString() === req.user._id.toString()
    );

    if (existingInterest) {
      return res.status(400).json({ message: 'You have already expressed interest in this asset' });
    }

    // Validate message
    if (!req.body.message || req.body.message.trim().length < 10) {
      return res.status(400).json({ message: 'Please provide a meaningful message (at least 10 characters)' });
    }

    // Validate offer if provided
    if (req.body.offer !== undefined && req.body.offer !== null) {
      if (isNaN(req.body.offer) || req.body.offer <= 0) {
        return res.status(400).json({ message: 'Offer must be a positive number' });
      }
    }

    asset.interested.push({
      user: req.user._id,
      message: req.body.message.trim(),
      offer: req.body.offer
    });

    await asset.save();
    await asset.populate('interested.user', 'name avatar');

    res.status(201).json(asset.interested[asset.interested.length - 1]);
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(400).json({ message: error.message || 'Failed to express interest' });
  }
};

// Mark asset as sold
exports.markAsSold = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    asset.status = 'Sold';
    asset.soldTo = req.body.buyerId;
    asset.soldPrice = req.body.soldPrice;
    asset.soldDate = new Date();

    await asset.save();
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get marketplace statistics
exports.getMarketplaceStats = async (req, res) => {
  try {
    const [
      totalAssets,
      totalTraded,
      byCategory,
      recentSales,
      totalValue
    ] = await Promise.all([
      Asset.countDocuments({ status: 'Available' }),
      
      Asset.countDocuments({ status: 'Sold' }),
      
      Asset.aggregate([
        { $match: { status: 'Available' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      Asset.find({ status: 'Sold' })
        .populate('seller', 'name avatar')
        .populate('soldTo', 'name avatar')
        .sort({ soldDate: -1 })
        .limit(10),
      
      Asset.aggregate([
        { $match: { status: 'Sold' } },
        { $group: { _id: null, total: { $sum: '$soldPrice' } } }
      ])
    ]);

    res.json({
      totalAssets,
      totalTraded,
      byCategory,
      recentSales,
      totalValueTraded: totalValue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get seller's assets
exports.getMyAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ seller: req.user._id })
      .populate('failureReport', 'startupName')
      .sort({ createdAt: -1 });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete asset
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await asset.deleteOne();
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
