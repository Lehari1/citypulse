const express = require('express');
const Report = require('./reportModel');
const router = express.Router();
const multer = require('multer');
const upload = multer();

// Create a new report
router.post('/', upload.none(), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      urgency,
      lat,
      lon,
      address,
      user
    } = req.body;

    const report = new Report({
      title,
      description,
      category,
      urgency: urgency || 'normal',
      location: {
        type: 'Point',
        coordinates: [parseFloat(lon), parseFloat(lat)],
        address: address || ''
      },
      user: user || undefined,
      // Add image, etc. as needed
    });

    await report.save();
    res.status(201).json(report);
  } catch (err) {
    console.log('Error creating report:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all reports, or filter by city if ?city= param is provided
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.city) {
      // Case-insensitive partial match on location.address
      query['location.address'] = { $regex: req.query.city, $options: 'i' };
    }
    if (req.query.user) {
      query['user'] = req.query.user;
    }
    const reports = await Report.find(query);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get a specific report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update a report (edit)
router.put('/:id', upload.none(), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      urgency
    } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Update fields
    if (title) report.title = title;
    if (description) report.description = description;
    if (category) report.category = category;
    if (urgency) report.urgency = urgency;

    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Mark report as solved
router.patch('/:id/solve', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    report.status = 'resolved';
    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Upvote a report
router.patch('/:id/upvote', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ msg: 'User ID is required' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    if (report.user && report.user.toString() === userId) {
      return res.status(400).json({ msg: 'You cannot upvote your own report' });
    }

    // Ensure upvotedBy is an array to prevent crashes on old data
    if (!Array.isArray(report.upvotedBy)) {
      report.upvotedBy = [];
    }

    const upvotedIndex = report.upvotedBy.findIndex(id => id.toString() === userId);

    let hasUpvoted;

    if (upvotedIndex > -1) {
      report.upvotedBy.splice(upvotedIndex, 1);
      report.upvotes = Math.max(0, report.upvotes - 1);
      hasUpvoted = false;
    } else {
      report.upvotedBy.push(userId);
      report.upvotes += 1;
      hasUpvoted = true;
    }

    await report.save();
    res.json({
      upvotes: report.upvotes,
      hasUpvoted,
      message: hasUpvoted ? 'Report upvoted' : 'Upvote removed',
    });
  } catch (err) {
    console.error('Upvote Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router; 