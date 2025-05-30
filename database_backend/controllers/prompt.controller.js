const db = require('../models');
const Prompt = db.Prompt;
const User = db.User;
const GameRound = db.GameRound;
const Game = db.Game;
const { Op } = db.Sequelize;

// Create a prompt
exports.create = async (req, res) => {
  try {
    if (!req.body.text || !req.body.creatorId || !req.body.roundId) {
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

// Retrieve all prompts for a round
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

// Assign prompts to players for a specific round
exports.assignPrompts = async (req, res) => {
  try {
    const { roundId } = req.params;
    
    // Get the game round and associated game
    const gameRound = await GameRound.findByPk(roundId, {
      include: [
        {
          model: Game,
          as: 'game',
          include: [
            {
              model: User,
              as: 'participants',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });
    
    if (!gameRound) {
      return res.status(404).send({
        message: `Game round with id=${roundId} not found.`
      });
    }
    
    // Get all prompts for this round
    const prompts = await Prompt.findAll({
      where: { roundId }
    });
    
    // Get all participants
    const participants = gameRound.game.participants;
    
    // Simple random assignment - each player gets a prompt that's not their own
    const assignments = [];
    
    for (const participant of participants) {
      // Find prompts not created by this participant
      const availablePrompts = prompts.filter(
        prompt => prompt.creatorId !== participant.id && !prompt.assignedToId
      );
      
      if (availablePrompts.length === 0) {
        continue; // Skip if no available prompts (should handle this better in production)
      }
      
      // Randomly select a prompt for this participant
      const randomIndex = Math.floor(Math.random() * availablePrompts.length);
      const selectedPrompt = availablePrompts[randomIndex];
      
      // Assign the prompt
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

// Get the prompt assigned to a specific player for a round
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
        message: `No prompt assigned to user=${userId} for round=${roundId}.`
      });
    }
    
    res.send(prompt);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving the prompt."
    });
  }
};
