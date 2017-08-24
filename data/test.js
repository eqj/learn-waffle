const fakeMongo = require('mongo-mock');
const mongoClient = fakeMongo.MongoClient;
const fakeRedis = require('fakeredis');
const util = require('util');
const models = require('./models.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chakram = require('chakram');

chai.use(chaiAsPromised);
const assert = chai.assert;
const expect = chakram.expect;

describe('Models', function() {
    describe('UUID Generation', function() {
        it('should generate a uuid and put it in redis', () => {
            // Connection URL
            let url = 'mongodb://localhost:27017/myproject';
            // Use connect method to connect to the Server
            return assert.eventually.equal(mongoClient.connect(url)
                .then((db) => {
                    let client = fakeRedis.createClient();
                    let testModel = models(db, client);

                    return testModel.generateAuthToken('bort')
                        .then((token) => {
                            if(token == null) {
                                return Promise.reject(new Error('token is null or undefined'));
                            }
                            return util.promisify(client.get).bind(client)(`auth_${token}`);
                        })
                }),'bort')
        });
    });
});

describe("Chakram", function() {
    it("should provide HTTP specific assertions", () => {
        let response = chakram.get('http://localhost:8080/');
        return expect(response).to.have.status(200);
    });
    it("should post to the guestbook", () => {
        return chakram.post('http://localhost:8080/api',{name: 'bort', email: 'bort@bort.bort', message: 'my name bort'})
            .then((response) => {
                expect(response).to.have.status(200);
                return chakram.get('http://localhost:8080/api')
            })
            .then((response) => {
                expect(response).to.have.status(200);
                expect(response.body[0].name).to.equal('bort');
                return chakram.wait();
            })
    });
});