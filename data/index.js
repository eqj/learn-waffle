const express = require('express');
const path = require('path');
const routes = require('./routes.js');
const bodyParse = require('body-parser');
const app = express();

var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://boop:LearnBoops@localhost:27017/learnboops?authSource=admin';

// Connect to the server
MongoClient.connect(url, function(err, db) {
    if(err != null) {
        console.error(err);
        process.exit(42);
    } else {
        console.log("We connected to the mongo server!");
    }
    routes(app, db);
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParse.json());
app.use(bodyParse.urlencoded({
    extended: true
}));

app.listen(8080, function () {
    console.log('Example app listening on port 8080!');
});
