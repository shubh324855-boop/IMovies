
const router = require('express').Router();
const auth = require('../middleware/auth');
const cinemaOwner = require('../middleware/cinemaOwner');
const admin = require('../middleware/admin');
const Theatre = require('../models/Theatre');

router.use(auth);

// Cinema owners submit a theatre for approval.
router.post('/', cinemaOwner, async (req, res, next) => {
  try {
    const { name, city, address, screens } = req.body;

    if (!name || !city || !address) {
      return res.status(400).json({
        message: 'Theatre name, city and address are required.'
      });
    }

    const theatre = await Theatre.create({
      name,
      city,
      address,
      screens: screens || 1,
      owner: req.user.id,
      approvalStatus: 'pending'
    });

    res.status(201).json(theatre);
  } catch (error) {
    next(error);
  }
});

// Owners see their own theatres; platform admins see all theatres.
router.get('/mine', cinemaOwner, async (req, res, next) => {
  try {
    const filter = req.user.role === 'platform_admin'
      ? {}
      : { owner: req.user.id };

    const theatres = await Theatre.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(theatres);
  } catch (error) {
    next(error);
  }
});

// Platform admin approves or rejects a theatre.
router.patch('/:id/approval', admin, async (req, res, next) => {
  try {
    const { approvalStatus } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({
        message: 'Approval status must be approved or rejected.'
      });
    }

    const theatre = await Theatre.findByIdAndUpdate(
      req.params.id,
      { approvalStatus },
      { new: true, runValidators: true }
    );

    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found.' });
    }

    res.json(theatre);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
