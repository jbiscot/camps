const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.get('/', catchAsync(campgrounds.index));

router.route('/new')
	.get(isLoggedIn, catchAsync(campgrounds.renderNewForm))
	// .post(validateCampground, catchAsync(campgrounds.createCampground));
	.post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground), (req, res) => {
		console.log(req.body, req.files);
	});
	// .post(upload.array('image'), (req, res) => {
	// 	console.log(req.body, req.files);
	// 	res.send('It worked...')
	// })



router.route('/:id')
	.get(catchAsync(campgrounds.showCampground))
	.put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;