const guestbook = require('./templates/guestbook.js');
const login = require('./templates/login.js');
const register = require('./templates/register.js');
const util = require('util');
const validator = require('validator');
const bcrypt = require('bcrypt');
const saltrounds = 10;

module.exports = ( {app, models, client} ) => {

    // Display login page
    app.get('/login', (req, res) => {
        res.send(login({}));
    });

    /*************************/
    // User logging in
    /*************************/
    app.post('/login', (req, res) => {
        let fields = {
            'username': req.body['username'],
            'password': req.body['password']
        };

        const validateLogin = (userEntry) => {
            console.log(userEntry);
            let alerts = [];
            if(userEntry.username == null || userEntry.username === ''){
                alerts.push('Username required');
            }

            if(userEntry.password == null || userEntry.password === ''){
                alerts.push('Password required');
            }

            return alerts;
        };

        let alerts = validateLogin(fields);

        const toAlertOrNotToAlert = () => {
            if (alerts.length > 0) {
                return Promise.resolve();
            }
            else {
                return models.getUser(fields.username)
                    .then((thisUser) => {
                        return bcrypt.compare(fields.password, thisUser.password)
                            .then((match) => {
                                if (!match) {
                                    alerts.push('Login failed');
                                }
                            })
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }
        };

        return toAlertOrNotToAlert()
            .then(() => {
                if(alerts.length === 0){
                    return models.generateAuthToken(fields.username)
                        .then((token) => {
                            res.cookie('auth', token);
                            res.redirect('/');
                        })
                }
                else {
                    res.send(login({alerts: alerts}));
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(err);
            });
    });

    // Display registration signup
    app.get('/register', (req, res) => {
        res.send(register({}));
    });

    /*************************/
    // Sign this user up
    /*************************/
    app.post('/register', (req, res) => {
        let fields = {
            '_id': req.body['username'],
            'email': req.body['email'],
            'password': req.body['password']
        };

        const validateRegistration = (userEntry) => {
            console.log(userEntry);
            let alerts = [];
            if(userEntry._id == null || userEntry._id === ''){
                alerts.push('Username required');
            }

            if(!validator.isEmail(userEntry.email)){
                alerts.push('Email invalid');
            }

            if(userEntry.password == null || userEntry.password === ''){
                alerts.push('Password required');
            }

            return alerts;
        };

        // Check the user's input before inserting to the database
        let alerts = validateRegistration(fields);

        const toAlertOrNotToAlert = () => {
            if (alerts.length > 0) {
                console.log('Registration failed validation');
                return Promise.resolve();
            }
            else {
                return bcrypt.hash(fields.password, saltrounds)
                    .then((hash) => {
                        fields.password = hash;
                        return Promise.all([models.registerUser(fields)])
                            .then(() => {
                                console.log('New user stored in database');
                            })
                    })
                    .catch((err) => {
                        if(validator.contains(err.toString(), 'duplicate key')){
                            alerts.push('Account already exists');
                        }
                        else{
                            console.error(err);
                        }
                    });
            }
        };

        return toAlertOrNotToAlert()
            .then(() => {
                if(alerts.length === 0){
                    return models.generateAuthToken(fields._id)
                        .then((token) => {
                            res.cookie('auth', token);
                            res.redirect('/');
                        })
                }
                else {
                    res.send(register({alerts: alerts}));
                }
            })
            .catch((err) => {
                console.error(err);
            })
    });

    /*************************/
    // Load the guestbook page
    /*************************/
    app.get('/', (req, res) => {

        const checkAuth = () => {
            if(req.cookies['auth'] != null) {
                let authCookie = req.cookies['auth'];
                return util.promisify(client.get).bind(client)(`auth_${authCookie}`)
                    .then((username) => {
                        return models.getUser(username)
                    });
            }
            else {
                return Promise.resolve(null);
            }
        };

        return checkAuth()
            .then((thisUser) => {
                return Promise.all([models.heyAshWhatchaSayin(), models.howManyVisitorsHaveWeHad(true)])
                    .then(([posts, visits]) => {
                        let username = '';
                        let email = '';
                        res.cookie('messages', '');
                        if (thisUser != null) {
                            username = thisUser._id;
                            email = thisUser.email;
                        }
                        res.send(guestbook({posts: posts, visits: visits, username: username, email: email, alerts: req.cookies['messages']}));
                    })
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(err);
            });
    });

    /*************************/
    // Post to the guestbook
    /*************************/
    app.post('/', (req, res) => {
        let thisPost = {
            'name': req.body['name'],
            'email': req.body['email'],
            'message': req.body['message'],
            'createdAt': new Date()
        };

        const validatePost = (post) => {
            let alerts = [];
            if(post.name == null || post.name === ''){
                alerts.push('Name required');
            }

            if(!validator.isEmail(post.email)) {
                alerts.push('Email invalid');
            }

            if(post.message == null || post.message === ''){
                alerts.push('Message required');
            }

            return alerts;
        };

        // Check the user's input before inserting to the database
        let alerts = validatePost(thisPost);

        const toAlertOrNotToAlert = () => {
            if (alerts.length > 0) {
                console.log('Message failed validation');
                return Promise.resolve();
            }
            else {
                return Promise.all([models.shoveThisInYourPostHole(thisPost), util.promisify(client.del).bind(client)('cachedPostsHtml')])
                .then(() => {
                    console.log(thisPost);
                    console.log('Message stored in database');
                    console.log('page cleared from cache');
                })
                .catch((err) => {
                    console.error(err);
                });
            }
        };

        return toAlertOrNotToAlert()
            .then(() => {
                res.cookie('messages', alerts);
                res.redirect('/');
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(err);
            });
    });
};