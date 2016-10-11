# Elasticsearch Example for Kaiser Permanente
*Running on IBM BlueMix and Compose Elasticsearch*

## Running the Application Locally

- Install [Node.JS](https://nodejs.org) (v6.0.0 or newer) and NPM
  - You can use [https://github.com/creationix/nvm](NVM) to manage multiple versions of Node.JS on the same machine if needed.
- Install the required packages with `npm install`
- Install [Elasticsearch](https://www.elastic.co/products/elasticsearch) (V2.0 or newer)
  - OSX + Homebrew users can use `brew install elasticsearch`
- Download seed data from `thrive.kaiserpermanente.org` (see below)
- Load your seed data into Elasticsearch (see below)
- Start the server (`npm start`)
- View the web application at the port printed out

## Building the Seed Files

To download the source JSON files from the production Kaiser Permanente website (thrive.kaiserpermanente.org), CURL can be used.  For example, should you want to include all facilities in the `Northern California` region, you would run:

```bash
curl -o data/nca.json 'https://thrive.kaiserpermanente.org/care-near-you/northern-california/wp-admin/admin-ajax.php' --data 'action=LocatorFacility&nonce=3ccea1cefe&region=NCA'
```

This will save that data into `data/nca.json` in this folder.

## Seeding Local Data

Once you have downloaded all the region files you wish to include, we'll use `bin/loader.js` to populate our Elasticsearch cluster.  Just like when deployed on BlueMix, we'll be reading in the `VCAP_SERVICES` environment variable.  We've have prepared a local version of this in `.env.development` which you can source to configure `VCAP_SERVICES` to point to the default localhost location for Elasticsearch, i.e: `localhost:9200`.

To load your seed files into Elasticsearch installed in the default localhost location, you can run:

```bash
source .env.development && ./bin/loader
```

## Seeding Remote Data

The same process as the above can be used to seed your remote database.  You will need to create a new `.env.production` file, and copy in the connection settings from your production Elasticsearch Compose cluster.  Once you have that file built, seeding production is as simple as:

```bash
source .env.production && ./bin/loader
```

## Deployment on BlueMix

Notes:
- Be sure to connect your Elasticsearch instance from Compose to your new application before Deployment
- BlueMix will install your dependancies automatically (`npm install`)

## API:
- Server Status: `curl -X GET "http://localhost:3000/api/status"`
- Check a Word: `curl -X GET "http://localhost:6002/api/nearest?lat=37.8269775&lon=-122.4229555"`

## Testing

Node.JS applications always configure `npm test` to run their test suite, and this application is no different. `npm test` will use mocha to run our test suite, which covers our server, loader, and Elasticsearch client.  You will need an Elasticsearch node running on the default port on localhost (i.e.: `localhost:9200`)

This project does not test the front-end code.

## References & Notes

- Original IBM BlueMix Elasticsearch Example: https://github.com/IBM-Bluemix/compose-elasticsearch-helloworld-nodejs
- This example's UI requires JQuery (remote) and uses the Google Maps Geocoding API (remote)
