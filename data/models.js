
module.exports = (db) => {
    const howManyVisitorsHaveWeHad = (increment, callback) => {
        var counter = db.collection('visitcounter');
        if (increment) {
            counter.insertOne({}, (err, result) => {
                if (err != null) {
                    callback(err, null);
                }
                else {
                    counter.count({}, callback);
                }
            });
        }
        else {
            counter.count({}, callback);
        }
    };

    const heyAshWhatchaSayin = (callback) => {
        var collection = db.collection('messages');
        collection.find({}).limit(10).sort(['createdAt', -1]).toArray(callback);
    };

    return {
        howManyVisitorsHaveWeHad: howManyVisitorsHaveWeHad,
        heyAshWhatchaSayin: heyAshWhatchaSayin,
    };
};