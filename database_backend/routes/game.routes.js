module.exports = app => {
  const games = require("../controllers/game.controller.js");
  const router = require("express").Router();
  const authentication = require("./authentication.js");

  router.post("/", authentication.authenticateFirebaseToken, games.create);
  
  router.put("/:id", authentication.authenticateFirebaseToken, games.update);

  router.put("/join/:id/auth", authentication.authenticateFirebaseToken, games.joinGameWithAuth);
  router.put("/join/:id/nauth", games.joinGameNoAuth)

  router.post("/:gameId/start", games.startGame);

  router.post("/:gameId/rounds/:roundNumber/end", games.endGameRound);

  router.get("/", games.findAll);

  router.get("/code/:code", games.findByCode);

  router.get("/:code/lobbyInfo", games.getLobbyInfo);

  router.get("/:id", games.findOne);

  app.use("/api/games", router);
};
