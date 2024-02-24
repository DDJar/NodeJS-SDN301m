const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  dishes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish'
  }]
});

const Favorites = mongoose.model('Favorites', favoriteSchema);

module.exports = Favorites;
