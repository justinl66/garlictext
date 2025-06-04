module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const router = require("express").Router();
  const authentication = require("./authentication.js");
  router.post("/", authentication.authenticateFirebaseToken, users.create);
  router.post("/ensure", authentication.authenticateFirebaseToken, users.ensureUserExists);

  router.get("/", authentication.authenticateFirebaseToken, users.findAll);
  router.get("/:id", users.findOne);

  router.put("/", authentication.authenticateFirebaseToken, users.update);

  router.delete("/", authentication.authenticateFirebaseToken, users.delete);
  
  app.use("/api/users", router);
};
