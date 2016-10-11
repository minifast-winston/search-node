'use strict';

const BOOT = new Date();

module.exports = function(app) {
  app.get('/api/status', function(req, res) {
    let uptime = Math.round((new Date().getTime() - BOOT.getTime()) / 1000);
    res.json({ happy: true, uptime: uptime });
  });
};
