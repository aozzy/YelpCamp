const Campground = require('../models/campground')
const {cloudinary} = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const campground = require('../models/campground');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken:mapBoxToken})


module.exports.index = async (req, res) => {
  const campGround = await Campground.find({});
  
  res.render("campgrounds/index", { campGround });
  
};


module.exports.RenderNewForm = (req, res) => {
 

  res.render("campgrounds/new");
}



module.exports.createCampground = async (req, res, next) => {
 const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1,

  }).send()
  
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry
  
  campground.images = req.files.map(el => ({url: el.path, filename:el.filename}))
  campground.author = req.user._id
  await campground.save();
  console.log(campground);
  req.flash('success', 'Successfully made a new campground!')
  res.redirect(`/campgrounds/${campground._id}`);

  
}


module.exports.getOneCampground = async (req, res) => {
  const { id } = req.params;
  
  const foundCamp = await Campground.findById(id).populate({path:'reviews',populate:{
    path:'author'
  }

}).populate('author')
  console.log(foundCamp);
 if(!foundCamp){
  req.flash('error', 'No campground found!')
 return res.redirect('/campgrounds')
 }

   res.render("campgrounds/show", { foundCamp });
 
}


module.exports.getEditCampground = async (req, res) => {
  const { id } = req.params;
  
  const foundCamp = await Campground.findById(id);
  
  if(!foundCamp){
    req.flash('error', 'No campground found!')
   return res.redirect('/campgrounds')
   }
   

  
  res.render("campgrounds/edit", { foundCamp });
}



module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const updatedCamp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    const imgs = req.files.map(el => ({url: el.path, filename:el.filename}))
    updatedCamp.images.push(...imgs)
    await updatedCamp.save()
    if(req.body.deleteImages) {
    await  updatedCamp.updateOne({$pull:{images:{filename:{$in: req.body.deleteImages}}}})
    for (let filename of req.body.deleteImages){
      // console.log('filename:',el);
     await cloudinary.uploader.destroy(filename)
    }
    // console.log(updatedCamp);
    };
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${updatedCamp._id}`);
  }


  module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect("/campgrounds");
  }