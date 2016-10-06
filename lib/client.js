const elasticsearch = require('elasticsearch');
const cfenv = require('cfenv');

class Client {
  constructor(env = process.env.VCAP_SERVICES) {
    this.env = env;
  }

  credentials(){
    return cfenv.getAppEnv({vcap: {services: this.env}}).services['compose-for-elasticsearch'][0].credentials;
  }

  urls() {
    return [
      this.credentials().uri,
      this.credentials().uri_direct_1
    ];
  }

  certificate() {
    if(!this.credentials().ca_certificate_base64){ return null; }
    var buffer = new Buffer(this.credentials().ca_certificate_base64, 'base64');
    return buffer;
  }

  configure() {
    var client = new elasticsearch.Client({
      hosts: this.urls(),
      ssl: {ca: this.certificate()}
    });
    return client;
  }
}

exports.Client = Client
