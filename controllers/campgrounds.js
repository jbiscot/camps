const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});

	res.render('campgrounds', { campgrounds });
}

module.exports.renderNewForm = async (req, res) => {
	res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
	const geoData = await geocoder.forwardGeocode({
		query: req.body.campground.location,
		limit: 1
	}).send();

	const campground = new Campground(req.body.campground);
	campground.author = req.user._id;
	campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
	campground.geometry = geoData.body.features[0].geometry;

	await campground.save();
	req.flash('success', 'You successfully created a new campground!')
	res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res, next) => {
	const { id: campgroundId } = req.params;

	//nested populate
	const campground = await Campground.findById(campgroundId).populate({
		path: 'reviews',
		populate: {
			path: 'author'
		}
	}).populate('author');

	if (!campground) {
		req.flash('error', 'Sorry, campground not found.');
		return res.redirect('/campgrounds');
	}

	res.render('campgrounds/show', { campground });
}

module.exports.updateCampground = async(req, res) => {
	const { id: campgroundId } = req.params;
	const campground = await Campground.findByIdAndUpdate(campgroundId, { ...req.body.campground });
	const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));

	if(imgs) {
		campground.images.push(...imgs);
	}

	if(req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}});
	}

	await campground.save();
	req.flash('success', 'Campground updated successfully!');
	res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
	const { id: campgroundId } = req.params;

	await Campground.findByIdAndDelete(campgroundId);
	req.flash('success', 'You successfully deleted a campground.');
	res.redirect('/campgrounds');
}

module.exports.renderEditForm = async (req, res) => {
	const { id: campgroundId } = req.params;
	const campground = await Campground.findById(campgroundId);

	if (!campground) {
		req.flash('error', 'Sorry, campground not found.');
		return res.redirect('/campgrounds');
	}

	res.render('campgrounds/edit', { campground });
}