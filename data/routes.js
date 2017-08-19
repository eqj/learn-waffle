const guestbook = require('./templates/guestbook.js');

module.exports = ( {app, models, client} ) => {

    // Load the guestbook page
    app.get('/', (req, res) => {
        client.get('cachedPostsHtml', (err, page) => {
            if(err != null) {
               console.error(err);
            }
            else {
                if(page != null) {
                   res.send(page);
                }
                else {
                    return Promise.all([models.heyAshWhatchaSayin(), models.howManyVisitorsHaveWeHad(true)])
                        .then(([posts, visits]) => {
                            let page = guestbook({posts: posts, visits: visits});
                            client.set('cachedPostsHtml', page);
                            res.send(page);
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                }
            }
        });
    });

    // Post to the guestbook
    app.post('/', (req, res) => {
        var thisPost = {
            'name': req.body['name'],
            'email': req.body['email'],
            'message': req.body['message'],
            'createdAt': new Date()
        };

        const validatePost = (post) => {
            console.log(post);
            var alerts = [];
            if(post.name == null || post.name === ''){
                alerts.push('Name is required, Bob');
            }

            // Holy shit this regex, thank you internet?
            var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!emailRegex.test(post.email)){
                alerts.push('That was not an email, Bob!');
            }

            if(post.message == null || post.message === ''){
                alerts.push('Bob you have to actually fill in a message, jeez');
            }

            return alerts;
        };

        // Check the user's input before inserting to the database
        var alerts = validatePost(thisPost);

        const toAlertOrNotToAlert = () => {
            if (alerts.length > 0) {
                return Promise.resolve();
            }
            else {
                return models.shoveThisInYourPostHole(thisPost);
            }
        };

        return toAlertOrNotToAlert()
            .then(() => {
                return Promise.all([models.heyAshWhatchaSayin(), models.howManyVisitorsHaveWeHad(false)])
                    .then(([posts, visits]) => {
                        console.log('Message stored');
                        res.send(guestbook({posts: posts, visits: visits,alerts: alerts}));
                    })
            })
            .catch((err) => {
                console.error(err);
            })
    });
};