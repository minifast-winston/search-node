const should = require('should');
const Loader = require('../../lib/loader').Loader;
const Client = require('../../lib/client').Client;

describe('Loader', () => {
  var loader;

  beforeEach(() => {
    loader = new Loader(__dirname + '/../fixtures');
  });

  describe('.mappings', () => {
    it('returns the mapping definitions', () => {
      Loader.mappings().should.deepEqual({
        facility: {
          properties: {
            loc: {
              type: 'geo_point',
              fielddata: {
                format: 'compressed',
                precision: '1km'
              }
            }
          }
        }
      });
    });
  });

  describe('.index', () => {
    it('returns an elasticsearch index name reflecting the NODE_ENV', () => {
      Loader.index().should.equal('test-kaiser-locations');
    });

    it('returns an elasticsearch index name reflecting other environements', () => {
      Loader.index('production').should.equal('production-kaiser-locations');
    });
  });

  describe('#files', () => {
    it('finds data files in the directory', () => {
      loader.files().length.should.equal(1);
      loader.files()[0].should.containEql('fixtures/test.json');
    });
  });

  describe('#facilities', () => {
    it('finds all facilities', (done) => {
      loader.facilities().length.should.equal(2);
      done();
    });
  });

  describe('#create', () => {
    var elasticsearch;

    beforeEach((done) => {
      var testEnv = {
        "compose-for-elasticsearch": [{
          "credentials": {
            "db_type": "elastic_search",
            "uri_direct_1": "http://localhost:9200",
            "uri": "http://localhost:9200"
          }
        }]
      };
      var client = new Client(testEnv);
      elasticsearch = client.configure();

      elasticsearch.indices.exists({
        index: Loader.index()
      }, (error, response) => {
        if (!response) { return done(); }
        if (error) { return done(error); }
        elasticsearch.indices.delete({
          index: Loader.index(),
          refresh: true,
        }, done);
      });
    });

    it('creates the proper index', (done) => {
      elasticsearch.indices.exists({
        index: Loader.index()
      }, (error, response) => {
        should.not.exist(error);
        response.should.equal(false);
        loader.create(elasticsearch, () => {
          elasticsearch.indices.exists({
            index: Loader.index()
          }, (error, response) => {
            should.not.exist(error);
            response.should.equal(true);
            done();
          });
        });
      });
    });

    it('creates a facilities mapping on the index', (done) => {
      loader.create(elasticsearch, () => {
        elasticsearch.indices.getMapping({
          index: Loader.index(),
          type: 'facility'
        }, (error, response) => {
          should.not.exist(error);
          response.should.deepEqual({
            'test-kaiser-locations': {mappings: {facility: Loader.mappings().facility}}
          });
          done();
        });
      });
    });
  });

  describe('#load', () => {
    var elasticsearch;

    beforeEach((done) => {
      var testEnv = {
        "compose-for-elasticsearch": [{
          "credentials": {
            "db_type": "elastic_search",
            "uri_direct_1": "http://localhost:9200",
            "uri": "http://localhost:9200"
          }
        }]
      };
      var client = new Client(testEnv);
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

    it('loads the fixture data', (done) => {
      loader.load(elasticsearch, (error) => {
        if (error) { return done(error); }
        elasticsearch.indices.refresh({index: Loader.index()}, (error) => {
          if (error) { return done(error); }
          elasticsearch.search({
            body: { query: { match: {'official_name': 'Wildomar Medical Offices'}}},
            index: Loader.index()
          }, (error, response) => {
            if (error) { return done(error); }
            response.hits.total.should.equal(1);
            response.hits.hits[0]._source.official_name.should.equal('Wildomar Medical Offices');
            done();
          });
        });
      });
    });
  });
});
