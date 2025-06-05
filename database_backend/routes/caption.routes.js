module.exports = app => {
  const captions = require("../controllers/caption.controller.js");
  const router = require("express").Router();
  const authentication = require("./authentication.js");

  router.post("/", captions.create);

  router.post("/:id/vote", captions.vote);

  router.get("/image/:imageId", captions.findByImageId);

  router.get("/round/:roundId", captions.findByRoundId);

  router.get("/:id", captions.findOne);
  app.use("/api/captions", router);
};
