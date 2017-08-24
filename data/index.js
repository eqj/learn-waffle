const express = require('express');
const path = require('path');
const bodyParse = require('body-parser');
const app = express();
const mongoClient = require('mongodb').MongoClient;
const redis = require('redis');
const util = require('util');
const validator = require('validator');
const routes = require('./routes.js');
const jobs = require('./jobs.js');
const models = require('./models.js');
const cookieParser = require('cookie-parser');
const kue = require('kue');

// Check the environment variables for a WORKER
var isWorker = process.env.WORKER === "true" || false;

// Create a kue queue...QQ
// let queue = kue.createQueue(port, host);
let queue = kue.createQueue();

// Connect to redis
//let client = redis.createClient(port, host);
let client = redis.createClient();
// Flush the cache each time we boot up, to make testing less painful
client.flushall();

// Connection URL
let url = 'mongodb://boop:LearnBoops@localhost:27017/learnboops?authSource=admin';

const createJob = ({name, data}) => {
    return new Promise( (yay, boo) => {
        queue.create(name, data)
            .save( (err) => {
                if(err) {
                    boo(err);
                }
                else {
                    yay();
                }
            });
    });
};

// Queue up an email to send
const sendEmail = ({recipient, subject, body}) => {
    return createJob({name: 'email', data: {
            recipient: recipient,
            subject: subject,
            body: body
        }});
};

// Middleware
const logAllCookiesMiddleware = (req, res, next) => {
    console.log(`cookies: ${req.cookies}`);
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

// Use some things on ALL the pages
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
    // I want the auth middleware everywhere too, but it needs a database. Barry is a good, good name for a database.
    app.use(authMiddleware(barry));

    if(isWorker) {
        console.log("I AM A WORKER!");
        jobs({queue: queue});
    }
    else {
        // Pass in the middleware that won't be used everywhere, so that it can be used where needed
        routes({app: app, models: barry, kickedOutIfNotLoggedInMiddleware: kickedOutIfNotLoggedInMiddleware, notNullMiddleware: notNullMiddleware, emailValidationMiddleware: emailValidationMiddleware, sendEmail: sendEmail});
    }
});

if(isWorker) {
    app.listen(8081, function () {
        console.log('Example worker listening on port 8081!');
    });
}
else {
    app.listen(8080, function () {
        console.log('Example app listening on port 8080!');
    });
}
