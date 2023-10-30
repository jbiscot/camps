const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/w_200');
});

ImageSchema.virtual('cardImage').get(function () {
	return this.url.replace('/upload', '/upload/ar_4:3,b_auto,c_fill_pad,g_auto');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
	title: String,
	images: [ImageSchema],
	geometry: {
		type: {
			type: String,
			enum: ['Point'],
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	},
	price: Number,
	description: String,
	location: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review'
		}
	]
}, opts);

CampgroundSchema.post('findOneAndDelete', async function(doc) {
	if(doc){
		await review.deleteMany({
			_id: {
				$in: doc.reviews
			}
		})
	}
});

// CampgroundSchema.virtual('properties.popUpMarkUp').get(function() {
// 	return "I am a message"
// });

CampgroundSchema.virtual('properties.popUpMarkUp').get(function() {
	return `<strong><a href=campgrounds/${this._id}>` + `${this.title}` + `</a></strong>` + `<p>${this.description.substring(0, 25)}...</p>`;
});

module.exports = mongoose.model('Campground', CampgroundSchema);