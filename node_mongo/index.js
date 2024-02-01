const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const localhost = "127.0.0.1";
const url = 'mongodb://' + localhost + ':27017/';
const dboper = require('./operations')
const dbname = 'conFusion';
MongoClient.connect(url).then((client) => {
    console.log('Connected correctly to server');
    const db = client.db(dbname);
    dboper.insertDocument(db, { name: "Barbecue", description: "Grilled beef" },
        "dishes")
        .then((result) => {
            console.log("Insert Document:\n", result.ops); return dboper.findDocuments(db, "dishes");
        })
        .then((docs) => {
            console.log("Found Documents:\n", docs);
            return dboper.updateDocument(db, { name: "King crab" },
                { description: "Updated Test" }, "dishes");
        })
        .then((result) => {
            console.log("Updated Document:\n", result.result);
            return dboper.findDocuments(db, "dishes");
        })
        .then((docs) => {
            console.log("Found Updated Documents:\n", docs); return client.close();
        })
        .catch((err) => console.log(err));
})
    .catch((err) => console.log(err));

