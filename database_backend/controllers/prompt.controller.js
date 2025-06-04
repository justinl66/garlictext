const db = require('../models');
const Prompt = db.Prompt;
const User = db.User;
const Game = db.Game;
const { Op } = db.Sequelize;

exports.create = async (req, res) => {
  try {    if (!req.body.text || !req.body.creatorId || !req.body.roundId) {
      return res.status(400).send({
        message: "Content can't be empty! Required fields: text, creatorId, roundId"
      });
    }
    
    const prompt = {
      text: req.body.text,
      creatorId: req.body.creatorId,
      roundId: req.body.roundId
    };
    
    const data = await Prompt.create(prompt);
    res.status(201).send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Prompt."
    });
  }
};

exports.findByRound = async (req, res) => {
  const { roundId } = req.params;
  
  try {
    const data = await Prompt.findAll({
      where: { roundId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'profilePictureUrl']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'username', 'profilePictureUrl']
        }
      ]
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving prompts."
    });
  }
};

exports.assignPrompts = async (req, res) => {
  try {
    const { roundId } = req.params;
    
    const game = await Game.findByPk(roundId, {
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] }
        }
      ]
    });
    
    if (!game) {
      return res.status(404).send({
        message: `Game with roomId=${roundId} not found.`
      });
    }
    
    const prompts = await Prompt.findAll({
      where: { roundId }
    });
    
    const participants = game.participants;
    
    const assignments = [];
    
    for (const participant of participants) {
      const availablePrompts = prompts.filter(
        prompt => prompt.creatorId !== participant.id && !prompt.assignedToId
      );
      
      if (availablePrompts.length === 0) {
        continue;
      }
      
      const randomIndex = Math.floor(Math.random() * availablePrompts.length);
      const selectedPrompt = availablePrompts[randomIndex];
      
      selectedPrompt.assignedToId = participant.id;
      await selectedPrompt.save();
      
      assignments.push({
        userId: participant.id,
        promptId: selectedPrompt.id,
        promptText: selectedPrompt.text
      });
    }
    
    res.send({
      message: "Prompts assigned successfully",
      assignments
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while assigning prompts."
    });
  }
};

exports.getAssignedPrompt = async (req, res) => {
  try {
    const { roundId, userId } = req.params;
    
    const prompt = await Prompt.findOne({
      where: {
        roundId,
        assignedToId: userId
      }
    });
    
    if (!prompt) {
      return res.status(404).send({
        message: `No prompt assigned to user=${userId} for room=${roundId}.`
      });
    }
    
    res.send(prompt);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving the prompt."
    });
  }
};
