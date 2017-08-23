const express = require('express');
const path = require('path');
const bodyParse = require('body-parser');
const app = express();
const mongoClient = require('mongodb').MongoClient;
const redis = require('redis');
const util = require('util');
const validator = require('validator');
const routes = require('./routes.js');
const models = require('./models.js');
const cookieParser = require('cookie-parser');

// Connect to redis
let client = redis.createClient();
client.flushall();
//let client = redis.createClient(port, host);

// Connection URL, very hard coded, much bad
var url = 'mongodb://boop:LearnBoops@localhost:27017/learnboops?authSource=admin';

// Middlewarez
const logAllCookiesMiddleware = (req, res, next) => {
    console.log(req.cookies);
    next();
};
const messagesMiddleware = (req, res, next) => {
    if(req.cookies['messages'] == null || req.cookies['messages'] === '') {
        req.messages = [];
    }
    else if(req.cookies['messages'].constructor != Array){
        req.messages = [req.cookies['messages']];
    }
    else {
        req.messages = req.cookies['messages'];
    }

    res.cookie('messages', '');

    next();
};
const authMiddleware = models => (req, res, next) => {
    if(req.cookies['auth'] != null) {
        let authCookie = req.cookies['auth'];
        return util.promisify(client.get).bind(client)(`auth_${authCookie}`)
            .then((username) => {
                return models.getUser(username)
                    .then((thisUser) => {
                        req.user = thisUser;
                        next();
                    })
            })
            .catch((err) => {
                req.user = null;
                next();
            });
    }
    else {
        req.user = null;
        next();
    }
};
const kickedOutIfNotLoggedInMiddleware = (req, res, next) => {
    if(req.user === null){
        res.cookie('messages', 'Must be logged in');
        res.redirect('/');
    }
    else{
        next();
    }
};
const notNullMiddleware = (someStrings) => (req, res, next) => {
    let alerts = [];

    someStrings.forEach((thisString) => {
        if(req.body[thisString] == null || req.body[thisString] === ''){
            alerts.push(`${thisString} required`);
        }
    });

    if(alerts.length > 0) {
        res.cookie('messages', alerts);
        res.redirect(req.get('referer'));
    }
    else {
        next();
    }
};
const emailValidationMiddleware = (req, res, next) => {
    if(!validator.isEmail(req.body['email'])){
        res.cookie('messages', 'Invalid email');
        res.redirect(req.get('referer'));
    }
    else{
        next();
    }
};

// Use some things
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParse.json());
app.use(bodyParse.urlencoded({
    extended: true
}));
app.use(logAllCookiesMiddleware);
app.use(messagesMiddleware);

// Connect to the server
mongoClient.connect(url, function(err, db) {
    if(err != null) {
        console.error(err);
        process.exit(42);
    } else {
        console.log("We connected to the mongo server!");
    }
    let barry = models(db, client);
    app.use(authMiddleware(barry));
    routes({app: app, models: barry, client: client, kickedOutIfNotLoggedInMiddleware: kickedOutIfNotLoggedInMiddleware, notNullMiddleware: notNullMiddleware, emailValidationMiddleware: emailValidationMiddleware});
});

app.listen(8080, function () {
    console.log('Example app listening on port 8080!');
});
