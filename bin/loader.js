#!/usr/bin/env node

const Client = require('../lib/client').Client;
const Loader = require('../lib/loader').Loader;

let loader = new Loader(__dirname + '/../data');
let client = new Client();
let elasticsearch = client.configure();
loader.create(elasticsearch, () => loader.load(elasticsearch, () => console.log('Load complete.')));
