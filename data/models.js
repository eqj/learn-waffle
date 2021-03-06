const uuid = require('uuid/v4');
const util = require('util');

// Mongo functions return promises already! How convenient!!

module.exports = (db, client) => {
    const howManyVisitorsHaveWeHad = () => {
        return util.promisify(client.incr).bind(client)('visitCounter')
    };

    const heyAshWhatchaSayin = () => {
        var collection = db.collection('messages');
        return collection.find({}).limit(10).sort(['createdAt', -1]).toArray();
    };

    const shoveThisInYourPostHole = (post) => {
        var collection = db.collection('messages');
        return collection.insertOne(post);
    };

    const registerUser = (post) => {
        var collection = db.collection('users');
        return collection.insertOne(post);
    };

    const getUser = (username) => {
        var collection = db.collection('users');
        return collection.findOne({_id:username});
    };

    const generateAuthToken = (username) => {
        let token = uuid();
        client.set(`auth_${token}`, username, 'EX', 86400);
        return Promise.resolve(token);
    };

    const getWhatsInThePostHole = (username) => {
        var collection = db.collection('messages');
        return collection.find({name:username}).limit(100).sort(['createdAt', -1]).toArray();
    };

    return {
        howManyVisitorsHaveWeHad: howManyVisitorsHaveWeHad,
        heyAshWhatchaSayin: heyAshWhatchaSayin,
        shoveThisInYourPostHole: shoveThisInYourPostHole,
        registerUser: registerUser,
        getUser: getUser,
        generateAuthToken: generateAuthToken,
        getWhatsInThePostHole: getWhatsInThePostHole
    };
};