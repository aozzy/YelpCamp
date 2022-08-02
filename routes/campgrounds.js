const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require('../models/campground');
const {isLoggedIn,validateCampground,isAuthor} = require('../middleware')
const { campgroundSchema } = require('../schemas.js')
const campgrounds = require('../controllers/campgrounds')
const multer  = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({ storage })

 router.route('/')
.get(catchAsync(campgrounds.index))
.post( isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground));

router.get("/new", isLoggedIn, (campgrounds.RenderNewForm));

router.route('/:id')
.get(catchAsync(campgrounds.getOneCampground))
.put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.editCampground))
.delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground));





router.get("/:id/edit",isLoggedIn,isAuthor,catchAsync(campgrounds.getEditCampground));






module.exports = router;
