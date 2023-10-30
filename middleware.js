const { campgroundSchema, reviewSchema } = require('./schemas/campgroundSchema');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review')

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl
		req.flash('error', 'You need to log in to add a campground.');
		return res.redirect('/login');
	}

	next();
}

module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);

	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
}

module.exports.isAuthor = async (req, res, next) => {
	const { id: campgroundId } = req.params;
	const campground = await Campground.findById(campgroundId);


	//it's checking for the campground author and not for the review author


	if (!campground.author.equals(req.user._id)) {
		req.flash('error', 'This action is not allowed under your currents permissions.');
		return res.redirect(`/campgrounds/${campgroundId}`);
	}

	next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
	const { id: campgroundId, reviewId } = req.params;
	const review = await Review.findById(reviewId);

	if (!review || !review.author.equals(req.user._id)) {
		req.flash('error', 'This action is not allowed under your currents permissions.');
		return res.redirect(`/campgrounds/${campgroundId}`);
	}

	next();
}

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);

	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
}