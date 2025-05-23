module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const router = require("express").Router();

  router.post("/", users.create);

  router.get("/", users.findAll);

  router.get("/:id", users.findOne);

  router.get("/firebase/:firebaseUid", users.findByFirebaseUid);

  router.put("/:id", users.update);

  router.delete("/:id", users.delete);

  app.use("/api/users", router);
};
