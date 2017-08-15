const contact = require('./templates/contact.js');
const thankyou = require('./templates/thankyou.js');

module.exports = ( app, db ) => {

    app.get('/', (req, res) => {
        res.send(contact());
    });

    app.post('/', (req, res) => {
        // Get the documents collection
        var collection = db.collection('messages');
        // Insert some documents
        collection.insertOne(req.body, (err, result) => {
            if(err != null){
                console.error(err);
            } else {
                console.log("Inserted a message into the collection");
            }
        });
        res.send(thankyou(req.body.name));
    });
};