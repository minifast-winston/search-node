const glob = require('glob');
const fs = require('fs');
const facilityMapping = require('../mappings/facility').Mapping;

class Loader {
  static mappings() {
    return {
      facility: facilityMapping
    }
  }

  static index(env = process.env.NODE_ENV) {
    env = env || 'development';
    return `${env}-kaiser-locations`;
  }

  constructor(path) {
    this.path = path
  }

  files() {
    return glob.sync(this.path + '/*.json');
  }

  facilities() {
    return this.files().reduce((bodies, file) => {
      return bodies.concat(JSON.parse(fs.readFileSync(file)).response.KPFacilities);
    }, []);
  }

  create(client, callback) {
    client.indices.create({
      index: Loader.index(),
    }, (error, response) => {
      if (error || !response) { callback(error, response); }
      client.indices.putMapping({
        index: Loader.index(),
        type: 'facility',
        body: Loader.mappings(),
      }, callback);
    });
  }

  load(client, callback) {
    let body = this.facilities().reduce((body, facility) => {
      body.push({index: {_index: Loader.index(), _type: 'facility'}});
      facility.loc = [parseFloat(facility.loc[0]), parseFloat(facility.loc[1])];
      body.push(facility);
      return body;
    }, []);

    client.bulk({body: body}, callback);
  }
}

exports.Loader = Loader
