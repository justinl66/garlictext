module.exports = app => {
  const images = require("../controllers/image.controller.js");
  const router = require("express").Router();
  const authentication = require("./authentication.js");



  router.post("/", authentication.authenticateFirebaseToken, images.create);

  router.put("/:id/enhance", authentication.authenticateFirebaseToken, images.updateEnhanced);

  router.put("/:id/caption", authentication.authenticateFirebaseToken, images.updateCaptionedImage);

  router.post("/:id/vote", authentication.authenticateFirebaseToken, images.vote);

  router.get("/round/:roundId", authentication.authenticateFirebaseToken, images.findByRoundId);

  router.get("/latest", images.getLatestImage);

  router.get("/:id/original", images.getOriginalImage);

  router.get("/:id/enhanced", images.getEnhancedImage);

  router.get("/:id/captioned", images.getCaptionedImage);

  router.get("/:id", authentication.authenticateFirebaseToken, images.findOne);
  app.use("/api/images", router);
};
