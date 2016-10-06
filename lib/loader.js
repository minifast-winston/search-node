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
}

exports.Loader = Loader
