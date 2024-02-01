var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/users');
var passport = require('passport');
router.use(bodyParser.json());
var authenticate = require('../authenticate');


// task 3 ass3
router.get('/', authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {

  User.find({})
    .then((user) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(user);
    }, (err) => next(err))
    .catch((err) => next(err));
});
router.post('/signup', async (req, res, next) => {
  try {
    const user = await User.register(new User({ username: req.body.username }), req.body.password);

    if (req.body.firstname)
      user.firstname = req.body.firstname;
    if (req.body.lastname)
      user.lastname = req.body.lastname;

    await user.save();

    passport.authenticate('local')(req, res, () => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, status: 'Registration Successful!' });
    });
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.json({ err: err.message });
  }
});
router.post('/login', passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.json({ success: true, status: 'Logout Successful!' });
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});



module.exports = router;
