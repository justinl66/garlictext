const { cleanupTemporaryUsers, findTemporaryUsers } = require('../jobs/cleanup');
const authentication = require('./authentication');

module.exports = app => {  const router = require("express").Router();
  
  router.post("/cleanup-temp-users", authentication.authenticateFirebaseToken, async (req, res) => {
    try {
      const deletedUsers = await cleanupTemporaryUsers();
      res.status(200).send({
        message: `Cleanup job completed successfully. Deleted ${deletedUsers} temporary users.`
      });
    } catch (err) {
      res.status(500).send({
        message: err.message || "Error running cleanup job"
      });
    }
  });
  
  router.get("/temp-users", authentication.authenticateFirebaseToken, async (req, res) => {
    try {
      const hours = req.query.hours ? parseInt(req.query.hours) : null;
      
      const tempUsers = await findTemporaryUsers(hours);
      res.status(200).send({
        count: tempUsers.length,
        users: tempUsers
      });
    } catch (err) {
      res.status(500).send({
        message: err.message || "Error finding temporary users"
      });
    }
  });
  
  app.use("/api/admin", router);
};
