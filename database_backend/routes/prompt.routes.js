module.exports = app => {
  const prompts = require("../controllers/prompt.controller.js");
  const router = require("express").Router();
  
  router.post("/", prompts.create);
  
  router.get("/rounds/:roundId", prompts.findByRound);
  
  router.post("/rounds/:roundId/assign", prompts.assignPrompts);
  
  router.get("/rounds/:roundId/users/:userId", prompts.getAssignedPrompt);
  
  app.use('/api/prompts', router);
};
