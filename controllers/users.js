const User = require('../models/user')


module.exports.render = (re,res)=>{
  res.render('users/register')
}


module.exports.registerUser = async(req,res)=>{
  try{

    const {username,email,password} = req.body
    const user =  new User({username,email})
  const registeredUser =  await User.register(user,password)
  req.login(registeredUser, err =>{
    if (err) return next()
    req.flash('success','Welcome to Yelp Camp')
      res.redirect('/campgrounds')
  })
  }catch(err){
    req.flash('error',err.message)
    res.redirect('/register')
  }
}


module.exports.login = (req,res)=>{
  res.render('users/login')
}


module.exports.authenticateUser = (req,res)=>{
  req.flash('success','Welcome Back!')
  const redirectUrl = req.session.returnTo || '/campgrounds'
  delete req.session.returnTo
  res.redirect(redirectUrl)
  }

  module.exports.logout = (req,res) => {
    req.logout()
    req.flash('success','Goodbye')
    res.redirect('/campgrounds')
  }