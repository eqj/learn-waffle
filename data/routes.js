const contact = require('./templates/contact.js');
const thankyou = require('./templates/thankyou.js');

module.exports = ( app, db ) => {

    app.get('/', (req, res) => {
        var collection = db.collection('messages');
        collection.find({}).limit(10).sort([['createdAt', -1]]).toArray((err, results) => {
            if(err != null){
                console.error(err);
            }
            else{
                var counter = db.collection('visitcounter');
                counter.insertOne({}, (err, result) => {
                   if(err != null){
                       console.error(err);
                   }
                   counter.count({}, (err, visits) => {
                       if(err != null){
                           console.error(err);
                       }
                       else{
                           console.log(`Visitor total: ${visits}`);
                           res.send(contact(results, visits));
                       }
                   })
                });
            }
        });
    });

    app.post('/', (req, res) => {
        // Get the documents collection
        var collection = db.collection('messages');
        // Insert some documents
        var thisPost = {
            'name': req.body['name'],
            'email': req.body['email'],
            'message': req.body['message'],
            'createdAt': new Date()
        };
        collection.insertOne(thisPost, (err, result) => {
            if(err != null){
                console.error(err);
            }
            else{
                console.log(`Inserted a message into the collection from ${req.body['email']}`);
            }
        });
        res.redirect('/');
    });
};