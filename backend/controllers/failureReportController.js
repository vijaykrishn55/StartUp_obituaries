const FailureReport = require('../models/FailureReport');

// Create a new failure report
exports.createFailureReport = async (req, res) => {
  try {
    // Validate required fields
    const { 
      startupName, 
      industry, 
      location, 
      teamSize, 
      operationalMonths, 
      failureDate, 
      primaryReason, 
      detailedAnalysis 
    } = req.body;
    
    if (!startupName || !industry || !location || !teamSize || !operationalMonths || 
        !failureDate || !primaryReason || !detailedAnalysis) {
      return res.status(400).json({ 
        message: 'Missing required fields for failure report' 
      });
    }

    if (detailedAnalysis.length < 100) {
      return res.status(400).json({ 
        message: 'Detailed analysis must be at least 100 characters long' 
      });
    }

    if (!location.city || !location.state || !location.country || 
        !location.coordinates || !location.coordinates.latitude || !location.coordinates.longitude) {
      return res.status(400).json({ 
        message: 'Complete location information including coordinates is required' 
      });
    }

    const failureReport = new FailureReport({
      ...req.body,
      founder: req.user._id
    });

    await failureReport.save();
    await failureReport.populate('founder', 'name avatar');
    
    res.status(201).json(failureReport);
  } catch (error) {
    console.error('Create failure report error:', error);
    res.status(400).json({ message: error.message || 'Failed to create failure report' });
  }
};

// Get all failure reports with filters
exports.getFailureReports = async (req, res) => {
  try {
    const { 
      industry, 
      reason, 
      country, 
      minFunding, 
      maxFunding,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query;

    const filter = { isPublic: true };

    if (industry) filter.industry = industry;
    if (reason) filter.primaryReason = reason;
    if (country) filter['location.country'] = country;
    if (minFunding || maxFunding) {
      filter.fundingRaised = {};
      if (minFunding) filter.fundingRaised.$gte = Number(minFunding);
      if (maxFunding) filter.fundingRaised.$lte = Number(maxFunding);
    }
    if (dateFrom || dateTo) {
      filter.failureDate = {};
      if (dateFrom) filter.failureDate.$gte = new Date(dateFrom);
      if (dateTo) filter.failureDate.$lte = new Date(dateTo);
    }

    const reports = await FailureReport.find(filter)
      .populate('founder', 'name avatar')
      .sort({ failureDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await FailureReport.countDocuments(filter);

    res.json({
      reports,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalReports: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get heatmap data - geographic distribution
exports.getHeatmapData = async (req, res) => {
  try {
    const { industry, reason, dateFrom, dateTo } = req.query;

    const filter = { isPublic: true };
    if (industry) filter.industry = industry;
    if (reason) filter.primaryReason = reason;
    if (dateFrom || dateTo) {
      filter.failureDate = {};
      if (dateFrom) filter.failureDate.$gte = new Date(dateFrom);
      if (dateTo) filter.failureDate.$lte = new Date(dateTo);
    }

    const heatmapData = await FailureReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            city: '$location.city',
            state: '$location.state',
            country: '$location.country',
            lat: '$location.coordinates.latitude',
            lng: '$location.coordinates.longitude'
          },
          count: { $sum: 1 },
          totalFunding: { $sum: '$fundingRaised' },
          avgTeamSize: { $avg: '$teamSize' },
          reasons: { $push: '$primaryReason' }
        }
      },
      {
        $project: {
          location: '$_id',
          count: 1,
          totalFunding: 1,
          avgTeamSize: 1,
          topReasons: {
            $slice: [
              {
                $map: {
                  input: {
                    $setUnion: '$reasons'
                  },
                  as: 'reason',
                  in: {
                    reason: '$$reason',
                    count: {
                      $size: {
                        $filter: {
                          input: '$reasons',
                          cond: { $eq: ['$$this', '$$reason'] }
                        }
                      }
                    }
                  }
                }
              },
              3
            ]
          }
        }
      }
    ]);

    res.json(heatmapData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get analytics and insights
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalFailures,
      byIndustry,
      byReason,
      byCountry,
      avgMetrics,
      timeline
    ] = await Promise.all([
      FailureReport.countDocuments({ isPublic: true }),
      
      FailureReport.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      FailureReport.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: '$primaryReason', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      FailureReport.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: '$location.country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      FailureReport.aggregate([
        { $match: { isPublic: true } },
        {
          $group: {
            _id: null,
            avgFunding: { $avg: '$fundingRaised' },
            avgTeamSize: { $avg: '$teamSize' },
            avgOperationalMonths: { $avg: '$operationalMonths' },
            totalFundingLost: { $sum: '$fundingRaised' }
          }
        }
      ]),
      
      FailureReport.aggregate([
        { $match: { isPublic: true } },
        {
          $group: {
            _id: {
              year: { $year: '$failureDate' },
              month: { $month: '$failureDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 24 }
      ])
    ]);

    res.json({
      totalFailures,
      byIndustry,
      byReason,
      byCountry,
      avgMetrics: avgMetrics[0] || {},
      timeline
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single failure report
exports.getFailureReportById = async (req, res) => {
  try {
    const report = await FailureReport.findById(req.params.id)
      .populate('founder', 'name avatar bio title company')
      .populate('comments.user', 'name avatar');

    if (!report) {
      return res.status(404).json({ message: 'Failure report not found' });
    }

    // Increment views
    report.views += 1;
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update failure report
exports.updateFailureReport = async (req, res) => {
  try {
    const report = await FailureReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Failure report not found' });
    }

    if (report.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(report, req.body);
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add comment to failure report
exports.addComment = async (req, res) => {
  try {
    const report = await FailureReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Failure report not found' });
    }

    report.comments.push({
      user: req.user._id,
      text: req.body.text
    });

    await report.save();
    await report.populate('comments.user', 'name avatar');

    res.status(201).json(report.comments[report.comments.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mark report as helpful
exports.markHelpful = async (req, res) => {
  try {
    const report = await FailureReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Failure report not found' });
    }

    const index = report.helpful.indexOf(req.user._id);
    
    if (index > -1) {
      report.helpful.splice(index, 1);
    } else {
      report.helpful.push(req.user._id);
    }

    await report.save();
    res.json({ helpful: report.helpful.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get nearby failures
exports.getNearbyFailures = async (req, res) => {
  try {
    const { latitude, longitude, radius = 100 } = req.query;

    const failures = await FailureReport.find({
      isPublic: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    })
    .limit(50)
    .populate('founder', 'name avatar');

    res.json(failures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
