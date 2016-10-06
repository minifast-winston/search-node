const should = require('should');
const Client = require('../../lib/client').Client;

describe('Client', () => {
  var client;

  beforeEach(() => {
    var fakeEnv = {
      "compose-for-elasticsearch": [{
        "credentials": {
          "db_type": "elastic_search",
          "uri_direct_1": "https://admin:admin@example.com:9201",
          "ca_certificate_base64": "ABC123",
          "uri": "https://admin:admin@example.com:9200"
        }
      }]
    };
    client = new Client(fakeEnv);
  });

  describe('#credentials', () => {
    it('returns credentials for compose elasticsearch', () => {
      client.credentials().db_type.should.equal('elastic_search');
    });
  });

  describe('#certificate', () => {
    describe('when there is a certificate in the environment', () => {
      it('returns a certificate', () => {
        client.certificate().should.deepEqual(new Buffer('ABC123', 'base64'));
      });
    })

    describe('when there is no certificate in the environment', () => {
      beforeEach(() => {
        var fakeEnv = {
          "compose-for-elasticsearch": [{
            "credentials": {
              "db_type": "elastic_search",
              "uri_direct_1": "https://admin:admin@example.com:9201",
              "uri": "https://admin:admin@example.com:9200"
            }
          }]
        };
        client = new Client(fakeEnv);
      });

      it('returns null', () => {
        should.not.exist(client.certificate());
      });
    })
  });

  describe('#urls', () => {
    it('selects the primary and backup urls for a compose elasticsearch cluster', () => {
      client.urls().length.should.equal(2);
      client.urls()[0].should.equal('https://admin:admin@example.com:9200');
      client.urls()[1].should.equal('https://admin:admin@example.com:9201');
    });
  });

  describe('#configure', () => {
    it('returns a properly-configured elasticsearch client', () => {
      should.exist(client.configure());
    });
  });
});
