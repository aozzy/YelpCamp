if(process.env.NODE_ENV !== "production"){
  require('dotenv').config()
}


const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError");
const {campgroundSchema,reviewSchema} = require('./schemas.js')
const Review = require('./models/review')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user')
const usersRoutes = require('./routes/users')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet');
const { url } = require('inspector');
const MongoStore = require("connect-mongo")(session)
const dbUrl =  process.env.DB_URL || "mongodb://localhost:27017/yelp-camp"
// process.env.DB_URL 
console.log('hello');
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  // useFindAndModify:false,
  useUnifiedTopology: true,
});
//put this in mongoose.connect "mongodb://localhost:27017/yelp-camp"
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,'public')))
app.use(flash())


app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
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
                "https://res.cloudinary.com/dix1bnzl7/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret =  process.env.SECRET || 'thisisareallylongsecretdoyouthinksomaybemaybenot'

const store =  new MongoStore({
  url:dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
})

store.on("error",function(e){
  console.log("session store error",e);
})

const sessionConfig = {
  store,
  secret,
  resave:false,
  saveUninitialized: true,
  cookie:{
    httpOnly:true,
    // secure:true,
    expires: Date.now() +  1000 * 60 * 60 * 24 * 7,
    maxAge:1000 * 60 * 60 * 24 * 7,

  }

}
app.use(mongoSanitize())
app.use(session(sessionConfig))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


// app.get('/fake', async(req,res)=>{
//   const user = new User({email:'fake@gmail.com',username:'fakeone',})
//  const newUser = await User.register(user,'fakeone')
//  res.send(newUser)
// })

app.use( (req,res,next)=>{
  console.log(req.query);
res.locals.currentUser = req.user 
res.locals.success= req.flash('success')
res.locals.error = req.flash('error')
next()
})


app.use("/campgrounds", campgroundsRoutes)

app.use("/campgrounds/:id/reviews", reviewsRoutes)

app.use("/",usersRoutes)


app.get("/", (req, res) => {
  res.render("home");
});




app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "oh no, something went wrong";
  res.status(statusCode).render("error", { err });
});
const port = process.env.PORT || 3000


app.listen(3000, () => {
  console.log(`Listeneting on port ${port}`);
});
