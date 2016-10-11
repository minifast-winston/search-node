'use strict';

const required = ['lat', 'lon'];

module.exports = function(app) {
  app.get('/api/nearest', function(req, res) {
    let params = {};

    for (let i = 0; i < required.length; i++) {
      let param = required[i];
      if (!req.query[param] || req.query[param].length === 0) {
        return res.json({error: `${param} is a required query param for this API`});
      }
    }

    app.clients.elasticsearch.search({
      body: {
        query: {
          "bool" : {
            "must" : {
              "match_all" : {}
            },
            "filter" : {
              "geo_distance" : {
                "distance" : "10000km",
                "loc" : {
                  lat: parseFloat(req.query.lat),
                  lon: parseFloat(req.query.lon)
                }
              }
            }
          }
        },
        "sort": [
          {
            "_geo_distance": {
              "loc" : {
                lat: parseFloat(req.query.lat),
                lon: parseFloat(req.query.lon)
              },
              "order":         "asc",
              "unit":          "km",
              "distance_type": "plane"
            }
          }
        ]
      },
      index: app.clients.index
    }, (error, response) => {
      if(error){
        res.json({error: error});
      }else{
        let hits = [];
        response.hits.hits.forEach((hit) => {
          hits.push({
            source: hit._source,
            distance: hit.sort[0],
          })
        });

        res.json({hits: hits});
      }
    });
  });
};
