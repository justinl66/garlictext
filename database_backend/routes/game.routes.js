module.exports = app => {
  const games = require("../controllers/game.controller.js");
  const router = require("express").Router();
  const authentication = require("./authentication.js");

  router.post("/", authentication.authenticateFirebaseToken, games.create);
  
  router.put("/:id", authentication.authenticateFirebaseToken, games.update);

  router.put("/join/:id/auth", authentication.authenticateFirebaseToken, games.joinGameWithAuth);
  router.put("/join/:id/nauth", games.joinGameNoAuth)

  router.put("/leave/:id/auth", authentication.authenticateFirebaseToken, games.leaveGameWithAuth);
  router.put("/leave/:id/nauth", games.leaveGameNoAuth);

  router.put("/:gameId/start", authentication.authenticateFirebaseToken, games.startGame);

  router.post("/:gameId/end", games.endGame); // Simplified from endGameRound to endGame

  router.get("/", games.findAll);

  router.get("/code/:code", games.findByCode);

  router.get("/query", games.query);

  router.get("/:code/lobbyInfo", games.getLobbyInfo);

  router.get("/:id/promptInfo", games.getPromptInfo);

  router.get("/:id", games.findOne);

  app.use("/api/games", router);
};
