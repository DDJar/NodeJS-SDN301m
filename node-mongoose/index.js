const mongoose = require('mongoose');
const Dishes = require('./models/dishes')

//nodejs v.16 can use localhost but v.18 must use 127.0.0.1
const url = 'mongodb://127.0.0.1:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {
    console.log('Connect correctly to server');

    Dishes.create({
        name: 'Uthappizza',
        description: 'Test '
    })
        .then((dish) => {
            console.log(dish);
            return Dishes.findByIdAndUpdate(dish._id, {
                $set: { description: 'Update test' }
            }, {
                new: true
            })
                .exec();
        })
        .then((dish) => {
            console.log(dish);

            dish.comments.push({
                rating:5,
                comment:'I\'m getting a sinking feeling!',
                author: 'Leonardo di Carpaccio'
            });
            return dish.save();
        })
        .then((dishes) => {
            console.log(dishes);
            return Dishes.remove;
        })
        .then((dish) => {
            return mongoose.connection.close();
        })
        .catch((err) => {
            console.log(err)
        });
})