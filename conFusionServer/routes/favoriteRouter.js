const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate('user')
      .populate({
        path: 'dishes',
        populate: {
          path: 'comments.author',
          model: 'User'
        }
      })
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      })
      .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then((favorites) => {
        if (!favorites) {
          Favorites.create({ user: req.user._id, dishes: req.body })
            .then((favorites) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');

              favorites.save()
                .then((favorite) => {
                  Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.json(favorite);
                    })
                })
                .catch((err) => {
                  return next(err);
                });

            })
            .catch((err) => next(err));
        } else {
          for (i = 0; i < req.body.length; i++)
            if (favorites.dishes.indexOf(req.body[i]._id) < 0)
              favorites.dishes.push(req.body[i]);
          favorites.save()
            .then((favorite) => {
              Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                })
            })
            .catch((err) => {
              return next(err);
            });

        }
      })
      .catch((err) => next(err));
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      })
      .catch((err) => next(err));
  });

favoriteRouter.route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorites) => {
        if (!favorites) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json({ "exists": false, "favorites": favorites });
        }
        else {
          if (favorites.dishes.indexOf(req.params.dishId) < 0) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ "exists": false, "favorites": favorites });
          }
          else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ "exists": true, "favorites": favorites });
          }
        }


      }, (err) => next(err))
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then((favorites) => {
        if (!favorites) {
          favorites.dishes.push({ "_id": req.params.dishId });
          favorites.save()
            .then((favorite) => {
              Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                })
            })
            .catch((err) => {
              return next(err);
            });

        } else {
          if (favorites.dishes.indexOf(req.params.dishId) < 0) {
            favorites.dishes.push(req.params.dishId);
            favorites.save()
              .then((favorites) => {
                Favorites.findById(favorites._id)
                  .populate('user')
                  .populate('dishes')
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                  })
              })
              .catch((err) => next(err));
          } else {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: false, message: 'Dish already in favorites' });
          }
        }
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorites) => {
        if (favorites && favorites.dishes.includes(req.params.dishId)) {
          favorites.dishes.pull(req.params.dishId);
          favorites.save()
            .then((favorites) => {
              Favorites.findById(favorites._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                })

            })
            .catch((err) => next(err));
        } else {
          const err = new Error('Dish ' + req.params.dishId + ' not found in your favorites!');
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });
module.exports = favoriteRouter;
