module.exports = app => {
  const images = require("../controllers/image.controller.js");
  const router = require("express").Router();
  const authentication = require("./authentication.js");

  console.log("🚀 Setting up image routes...");

  router.post("/", authentication.authenticateFirebaseToken, images.create);

  router.put("/:id/enhance", authentication.authenticateFirebaseToken, images.updateEnhanced);

  router.post("/:id/vote", authentication.authenticateFirebaseToken, images.vote);

  router.get("/round/:roundId", authentication.authenticateFirebaseToken, images.findByRoundId);

  router.get("/latest", images.getLatestImage);

  router.get("/:id/original", images.getOriginalImage);

  router.get("/:id/enhanced", images.getEnhancedImage);

  router.get("/:id", authentication.authenticateFirebaseToken, images.findOne);

  app.use("/api/images", router);
  console.log("✅ Image routes configured successfully");
};
