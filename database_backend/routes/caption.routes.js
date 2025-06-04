module.exports = app => {
  const captions = require("../controllers/caption.controller.js");
  const router = require("express").Router();
  const authentication = require("./authentication.js");

  console.log("🚀 Setting up caption routes...");

  router.post("/", authentication.authenticateFirebaseToken, captions.create);

  router.post("/:id/vote", authentication.authenticateFirebaseToken, captions.vote);

  router.get("/image/:imageId", authentication.authenticateFirebaseToken, captions.findByImageId);

  router.get("/round/:roundId", authentication.authenticateFirebaseToken, captions.findByRoundId);

  router.get("/:id", authentication.authenticateFirebaseToken, captions.findOne);

  app.use("/api/captions", router);
  console.log("✅ Caption routes configured successfully");
};
