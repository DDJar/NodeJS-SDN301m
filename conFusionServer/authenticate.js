var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var config = require('./config.js');
var FacebookTokenStrategy = require('passport-facebook-token');

//task1 ass3
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next();
    } else {
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};
exports.verifyOrdinaryUser = (req, res, next) => {

    if (!req.isAuthenticated()) {
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    }
    req.user = req.user;
    next();
};
exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey,
        { expiresIn: 3600 });
};
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        console.log("JWT payload: ", jwt_payload);
        const user = await User.findOne({ _id: jwt_payload._id });

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));
exports.verifyUser = passport.authenticate('jwt', {session: false});
exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ facebookId: profile.id })
        .then(user => {
            if (user) {
                return done(null, user);
            } else {
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                return user.save();
            }
        })
        .then(user => {
            return done(null, user);
        })
        .catch(err => {
            return done(err, false);
        });
}));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());