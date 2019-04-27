var express = require("express");

module.exports = function(webserver, controller) {
  // add custom routes for your web server here.

  webserver.use(express.static("frontend"));

  webserver.get("/", (req, res) => {
    res.redirect("index.html");
  });
};
