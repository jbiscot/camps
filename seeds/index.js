const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelpCamp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(
  console.log('Success: Connection stablished at seeds.')
)
  .catch((err)=>{
  console.log('Error: Connection failed at seeds.');
  console.log(err);
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
	await Campground.deleteMany({});

	for (let i = 0; i < 15; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const randomPrice = Math.floor(Math.random() * 30);
		const city = cities[random1000];

		const camp = new Campground({
			title: `${sample(descriptors)} ${sample(places)}`,
			location: `${city.city}, ${city.state}`,
			author: '6269be4f7b34af3ca5fe0294',
			price: randomPrice,
			description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempore ipsam architecto dolores sed, labore quaerat vitae ullam, mollitia veritatis quo modi recusandae nostrum saepe, id est. Laborum enim odit expedita!',
			geometry: {
				type: "Point",
				coordinates: [
					cities[random1000].longitude,
					cities[random1000].latitude,
				]
			},
			images: [
				{
					url: 'https://res.cloudinary.com/dqivzyfhe/image/upload/v1651792692/YelpCamp/xtaxnlh8zu5h6nguhty3.jpg',
					filename: 'YelpCamp/xtaxnlh8zu5h6nguhty3'
				},
				{
					url: 'https://res.cloudinary.com/dqivzyfhe/image/upload/v1651792692/YelpCamp/rgpr4rckeygceqqf0ruz.jpg',
					filename: 'YelpCamp/rgpr4rckeygceqqf0ruz'
				}
			]
		})
		await camp.save();
	}
} 

seedDb().then(()=> {
  mongoose.disconnect(); //or mongoose.connection.close()
});