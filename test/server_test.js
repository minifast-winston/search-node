const should = require('should');
const request = require('request');
const Client = require('../lib/client').Client;
const Loader = require('../lib/loader').Loader;
let app, client, loader, elasticsearch;

let testEnv = {
  "compose-for-elasticsearch": [{
    "credentials": {
      "db_type": "elastic_search",
      "uri_direct_1": "http://localhost:9200",
      "uri": "http://localhost:9200"
    }
  }]
};

describe('Server', () => {

  before((done) => {
    process.env.PORT = 3001;
    ServerBuilder = require(__dirname + '/../server/server.js');
    ServerBuilder(testEnv, function(error, _app){
      app = _app;
      done();
    });
  });

  before((done) => {
    client = new Client(testEnv);
    loader = new Loader(__dirname + '/fixtures');
    elasticsearch = client.configure();

    elasticsearch.indices.exists({
      index: Loader.index()
    }, (error, response) => {
      if (!response) { return done(); }
      if (error) { return done(error); }
      elasticsearch.indices.delete({
        index: Loader.index(),
        refresh: true,
      }, () => {
        loader.create(elasticsearch, done);
      });
    });
  });

  before((done) => {
    loader.load(elasticsearch, done);
  });

  after((done) => {
    app.server.close();
    process.nextTick(done);
  });

  it('should have booted the server on the proper port', () => {
    app.server.address().port.should.equal(3001);
  });

  it('should respond with a status API', (done) => {
    request.get('http://localhost:3001/api/status', function(error, response) {
      should.not.exist(error);
      var body = JSON.parse(response.body);
      body.happy.should.equal(true);
      body.uptime.should.be.greaterThanOrEqual(0);
      done();
    });
  });

});
