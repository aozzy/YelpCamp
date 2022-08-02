const mongoose = require("mongoose");
const Review = require('./review')
const Schema = mongoose.Schema;
const User = require('./user')

const ImageSchema = new Schema({
  url:String,
    filename:String,
})

ImageSchema.virtual('thumbnail').get(function(){
 return this.url.replace('/upload','/upload/w_200')
})
const opts = {toJSON: {virtuals:true}}

const CampgroundSchema = new Schema({
  title: String,
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
  images: [ImageSchema],
  price: Number,
  description: String,
  location: String,
  author:{
    type: Schema.Types.ObjectId, ref:'User'
  },
  reviews:[{
    type: Schema.Types.ObjectId, ref:'Review'
  }]
},opts);

CampgroundSchema.virtual('properties.popUpMarker').get(function(){
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong> 
  <p>${this.description.substring(0,20)}...</p>`
 })


CampgroundSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
      await Review.deleteMany({
          _id: {
              $in: doc.reviews
          }
      })
  }
})

// CampgroundSchema.post('findOneAndDelete',async function(campground){
//   if (campground.reviews.length){
//     const res = await Review.deleteMany({_id:{$in:campground.reviews}})
//   }
//   console.log(campground);
// })

module.exports = mongoose.model("Campground", CampgroundSchema);


