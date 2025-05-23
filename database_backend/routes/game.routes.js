module.exports = app => {
  const games = require("../controllers/game.controller.js");
  const router = require("express").Router();

  router.post("/", games.create);

  router.post("/join", games.joinGame);

  router.post("/:gameId/start", games.startGame);

  router.post("/:gameId/rounds/:roundNumber/end", games.endGameRound);

  router.get("/", games.findAll);

  router.get("/code/:code", games.findByCode);

  router.get("/:id", games.findOne);

  app.use("/api/games", router);
};
