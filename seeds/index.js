const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("../seeds/cities");
const { places, descriptors,images } = require("../seeds/seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,

  useUnifiedTopology: true,
});

//* to seed this file run node seeds/index.js
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});
const sample = (array) => array[Math.floor(Math.random() * array.length)];
//* the sample function will get a random element from an array
//* we then pass in the places and descriptors array to get a random title
//* with the for loop below we loop 50 times an create 50 random cities from the cities file
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 150; i++) {
    const random1000 = Math.floor(Math.random() * 1000) + 1;
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = await new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)}  ${sample(places)}`,
      author: '61ebecc17487b0941cbbfd44',
      images:[
        {url:`${sample(images)}`,
        filename:'',
           
      }],
      geometry: { 
        type: 'Point', 
        coordinates: [ cities[random1000].longitude,
                      cities[random1000].latitude
                    ] 
      },
      description:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Veritatis debitis molestias nobis ea, porro consequuntur, dolore ex reiciendis veniam fugiat beatae quod ab, architecto reprehenderit distinctio voluptatum laborum qui illum!",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
