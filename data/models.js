
// Mongo functions return promises already! How convenient!!

module.exports = (db) => {
    const howManyVisitorsHaveWeHad = (increment) => {
        var counter = db.collection('visitcounter');
        if (increment) {
            return counter.insertOne({})
                .then(() => {
                    return counter.count({});
                })
        }
        else {
            return counter.count({});
        }
    };

    const heyAshWhatchaSayin = () => {
        var collection = db.collection('messages');
        return collection.find({}).limit(10).sort(['createdAt', -1]).toArray();
    };

    const shoveThisInYourPostHole = (post) => {
        var collection = db.collection('messages');
        return collection.insertOne(post);
    };

    return {
        howManyVisitorsHaveWeHad: howManyVisitorsHaveWeHad,
        heyAshWhatchaSayin: heyAshWhatchaSayin,
        shoveThisInYourPostHole: shoveThisInYourPostHole,
    };
};