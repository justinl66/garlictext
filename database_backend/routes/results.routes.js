module.exports = app => {
  const results = require("../controllers/results.controller.js");
  const router = require("express").Router();
  
  // get game results (player rankings and top drawings)
  router.get("/games/:gameId", results.getGameResults);
  
  app.use('/api/results', router);
};
