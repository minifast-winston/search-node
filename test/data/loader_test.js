const should = require('should');
const Loader = require('../../lib/loader').Loader;

describe('Loader', () => {
  var loader;

  beforeEach(() => {
    loader = new Loader(__dirname + '/../fixtures');
  });

  describe('.mappings', () => {
    it('returns the mapping definitions', () => {
      Loader.mappings().should.deepEqual({
        mappings: {
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
    it('finds all facilities', () => {
      loader.facilities().length.should.equal(1);
      loader.facilities()[0].official_name.should.equal('Wildomar Medical Offices');
    });
  });

  describe('#load')
});
