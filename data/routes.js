const contact = require('./templates/contact.js');

module.exports = ( app, db, models ) => {

    app.get('/', (req, res) => {
        models.heyAshWhatchaSayin((err, posts) => {
            if(err != null){
                console.error(err);
            }
            else{
                models.howManyVisitorsHaveWeHad(true, (err, visits) => {
                    if(err != null) {
                        console.error(err);
                    }
                    else {
                        res.send(contact(posts, visits));
                    }
                });
            }
        });
    });

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

        var alerts = validatePost(thisPost);

        var collection = db.collection('messages');
        if(alerts.length > 0) {
            models.heyAshWhatchaSayin((err, posts) => {
                if(err != null) {
                    console.error(err);
                }
                else {
                    console.log(`Inserted a message into the collection from ${req.body['email']}`);
                    models.howManyVisitorsHaveWeHad(false, (err, visits) => {
                        res.send(contact(posts, visits, alerts));
                    });
                }
            });
        }
        else {
            collection.insertOne(thisPost, (err, result) => {
                if(err != null){
                    console.error(err);
                }
                else{
                    models.heyAshWhatchaSayin((err, posts) => {
                        if(err != null) {
                            console.error(err);
                        }
                        else {
                            console.log(`Inserted a message into the collection from ${req.body['email']}`);
                            models.howManyVisitorsHaveWeHad(false, (err, visits) => {
                                res.send(contact(posts, visits, alerts));
                            });
                        }
                    });
                }
            });
        }
    });
};