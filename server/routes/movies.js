const router = require('express').Router();
const Movie = require('../models/Movie');
const Show = require('../models/Show');
router.get('/', async (req, res, next) => { try { res.json(await Movie.find().sort({ createdAt: -1 })); } catch (e) { next(e); } });
router.get('/:id/shows', async (req, res, next) => { try { res.json(await Show.find({ movie: req.params.id }).populate('movie').sort({ showDate: 1, showTime: 1 })); } catch (e) { next(e); } });
module.exports = router;
