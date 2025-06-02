module.exports = app => {
  const images = require("../controllers/image.controller.js");
  const router = require("express").Router();

  router.post("/", images.create);

  router.put("/:id/enhance", images.updateEnhanced);

  router.post("/:id/vote", images.vote);

  router.get("/round/:roundId", images.findByRoundId);

  router.get("/:id/original", images.getOriginalImage);

  router.get("/:id/enhanced", images.getEnhancedImage);

  router.get("/:id", images.findOne);

  app.use("/api/images", router);
};
