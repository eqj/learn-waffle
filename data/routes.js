const guestbookTemplate = require('./templates/guestbook.js');
const loginTemplate = require('./templates/login.js');
const registerTemplate = require('./templates/register.js');
const individualPostsTemplate = require('./templates/individualPosts.js');
const util = require('util');
const validator = require('validator');
const bcrypt = require('bcrypt');
const saltrounds = 10;

module.exports = ( {app, models, client, kickedOutIfNotLoggedInMiddleware, notNullMiddleware, emailValidationMiddleware} ) => {

    // Display login page
    app.get('/login', (req, res) => {
        res.send(loginTemplate({alerts: req.messages}));
    });

    /*************************/
    // User logging in
    /*************************/
    app.post('/login', notNullMiddleware(['username','password']), (req, res) => {
        let fields = {
            'username': req.body['username'],
            'password': req.body['password']
        };

        return models.getUser(fields.username)
            .then((thisUser) => {
                return bcrypt.compare(fields.password, thisUser.password)
                    .then((match) => {
                        if (!match) {
                            res.cookie('messages', 'Login failed');
                            res.redirect('/login');
                        }
                    })
                    .then(() => {
                        return models.generateAuthToken(fields.username)
                            .then((token) => {
                                res.cookie('auth', token);
                                res.redirect('/');
                            })
                    })
                })
            .catch((err) => {
                console.error(err);
            });
    });

    // Display registration signup
    app.get('/register', (req, res) => {
        res.send(registerTemplate({alerts: req.messages}));
    });

    /*************************/
    // Sign this user up
    /*************************/
    app.post('/register', notNullMiddleware(['username','email','password']), emailValidationMiddleware, (req, res) => {
        let fields = {
            '_id': req.body['username'],
            'email': req.body['email'],
            'password': req.body['password']
        };

        return bcrypt.hash(fields.password, saltrounds)
            .then((hash) => {
                fields.password = hash;
                return Promise.all([models.registerUser(fields)])
                    .then(() => {
                        console.log('New user stored in database');
                    })
                    .then(() => {
                        return models.generateAuthToken(fields._id)
                            .then((token) => {
                                res.cookie('auth', token);
                                res.redirect('/');
                            })
                    })
            })
            .catch((err) => {
                if(validator.contains(err.toString(), 'duplicate key')){
                    res.cookie('messages', 'Account already exists');
                    res.redirect('/register');
                }
                else{
                    console.error(err);
                    res.status(500).send(err);
                }
            });
    });

    /*************************/
    // Load the guestbook page
    /*************************/
    app.get('/', (req, res) => {
        return Promise.all([models.heyAshWhatchaSayin(), models.howManyVisitorsHaveWeHad(true)])
        .then(([posts, visits]) => {
            let username = '';
            let email = '';
            res.cookie('messages', '');
            if (req.user != null) {
                username = req.user._id;
                email = req.user.email;
            }
            res.send(guestbookTemplate({posts: posts, visits: visits, username: username, email: email, alerts: req.messages}));
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(err);
        });
    });

    /*************************/
    // Post to the guestbook
    /*************************/
    app.post('/', notNullMiddleware(['name','email','message']), emailValidationMiddleware, (req, res) => {
        let thisPost = {
            'name': req.body['name'],
            'email': req.body['email'],
            'message': req.body['message'],
            'createdAt': new Date()
        };

        return Promise.all([models.shoveThisInYourPostHole(thisPost), util.promisify(client.del).bind(client)('cachedPostsHtml')])
            .then(() => {
                console.log(thisPost);
                console.log('Message stored in database');
                res.redirect('/');
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(err);
            });
    });

    /*************************/
    // Load one user's posts
    /*************************/
    app.get('/user/:username', kickedOutIfNotLoggedInMiddleware, (req, res) => {

        return models.getWhatsInThePostHole(req.params.username)
            .then((posts) => {
                res.send(individualPostsTemplate({posts: posts, username: req.params.username}));
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(err);
            });
    });
};