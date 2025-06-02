module.exports = app => {
  const games = require("../controllers/game.controller.js");
  const router = require("express").Router();
  const authentication = require("./authentication.js");

  router.post("/", authentication.authenticateFirebaseToken, games.create);
  
  router.put("/:id", authentication.authenticateFirebaseToken, games.update);

  router.post("/join", games.joinGame);

  router.post("/:gameId/start", games.startGame);

  router.post("/:gameId/rounds/:roundNumber/end", games.endGameRound);

  router.get("/", games.findAll);

  router.get("/code/:code", games.findByCode);

  router.get("/:id", games.findOne);

  app.use("/api/games", router);
};
