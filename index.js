if (process.env.NODE_ENV !== "production") {
	require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const morgan = require('morgan');
const ExpressError = require('./utils/ExpressError');

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');
const User = require('./models/user');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const session = require('express-session');
const flash = require('connect-flash');

//security
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

//DB connections deployed x local
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelpCamp';

//Mongo Session
const MongoStore = require('connect-mongo');

mongoose.connect(dbURL, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
.then(()=>{
  console.log('MongoDB connected.');
})
.catch((err)=>{
  console.log('ERROR at MongoDB connection!');
  console.log(err);
})

////Connecting using the 'on'/'once' mongoose methods
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error: "))
// db.once("open", ()=>{
//   console.log("MongoDB database connected");
// })`

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('tiny'));

app.use(mongoSanitize());

const scriptSrcUrls = [
	"https://stackpath.bootstrapcdn.com/",
	"https://api.tiles.mapbox.com/",
	"https://api.mapbox.com/",
	"https://kit.fontawesome.com/",
	"https://cdnjs.cloudflare.com/",
	"https://cdn.jsdelivr.net/",
	"https://res.cloudinary.com/dv5vm4sqh/"
];
const styleSrcUrls = [
	"https://kit-free.fontawesome.com/",
	"https://stackpath.bootstrapcdn.com/",
	"https://api.mapbox.com/",
	"https://api.tiles.mapbox.com/",
	"https://fonts.googleapis.com/",
	"https://use.fontawesome.com/",
	"https://cdn.jsdelivr.net/",
	"https://res.cloudinary.com/dv5vm4sqh/"
];
const connectSrcUrls = [
	"https://*.tiles.mapbox.com",
	"https://api.mapbox.com",
	"https://events.mapbox.com",
	"https://res.cloudinary.com/dv5vm4sqh/"
];
const fontSrcUrls = ["https://res.cloudinary.com/dqivzyfhe/"];

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				"https://res.cloudinary.com/dqivzyfhe/",
				"https://images.unsplash.com/"
			],
			fontSrc: ["'self'", ...fontSrcUrls],
			mediaSrc: ["https://res.cloudinary.com/dv5vm4sqh/"],
			childSrc: ["blob:"]
		}
	})
);

const secret = process.env.SECRET || 'changemelater!';

const store = MongoStore.create({
	mongoUrl: dbURL,
	touchAfter: 24 * 60 * 60,
	crypto: {
		secret: secret
	}
});

store.on('error', function(e) {
	console.log('Session store error', e);
});

const sessionConfig = {
	store,
	name: 'session',
	secret: secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		//secure: true
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//they work as globals that we have access on every single template
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.get('/', (req, res) => {
	res.render('home');
});

app.use('/', usersRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.all('*', (req, res, next) => {
	next(new ExpressError('Page not found.', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	
	if(!err.message) err.message = 'Ops! Something went wrong.';
	
	res.status(statusCode).render('error', { err });
});


const port = process.env.PORT || 3000;

app.listen(port, (req, res) => {
  console.log(`Localhost Server connected and listening to port ${port}.`);
});