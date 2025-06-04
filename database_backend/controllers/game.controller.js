const db = require('../models');
const Game = db.Game;
const User = db.User;
const GameRound = db.GameRound;
const { Op } = db.Sequelize;

const generateGameCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const existingGame = await Game.findOne({ where: { code } });
    if (!existingGame) {
      isUnique = true;
    }
  }

  return code;
};
exports.create = async (req, res) => {
  try {   
    if(!req.user.uid){
      return res.status(401).send({
        message: "Unauthorized! Please log in."
      });
    }
    if (!req.body.name) {
      return res.status(400).send({
        message: "Host ID and game name are required!"
      });
    }    const code = await generateGameCode();

    const game = {
      id: code,
      name: req.body.name,
      hostId: req.user.hostId,
      maxPlayers: req.body.maxPlayers || 8,
      totalRounds: req.body.totalRounds || 3
    };    const createdGame = await Game.create(game);
    
    const host = await User.findByPk(req.body.hostId);
    if (host) {
      await createdGame.addParticipant(host);
    }

    res.status(201).send(createdGame);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Game."
    });
  }
};

exports.joinGame = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.gameCode) {
      return res.status(400).send({
        message: "User ID and game code are required!"
      });
    }    const { userId, gameCode } = req.body;

    const game = await Game.findOne({ 
      where: { id: gameCode },
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
        message: `Game with code ${gameCode} not found.`
      });
    }    if (game.participants.length >= game.maxPlayers) {
      return res.status(400).send({
        message: "Game is already full."
      });
    }    if (game.status !== 'waiting') {
      return res.status(400).send({
        message: "Cannot join game that is already in progress."
      });
    }    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({
        message: `User with ID ${userId} not found.`
      });
    }    const isAlreadyParticipant = game.participants.some(participant => participant.id === userId);
    if (isAlreadyParticipant) {
      return res.status(400).send({
        message: "User is already in this game."
      });
    }    await game.addParticipant(user);
    const updatedGame = await Game.findOne({ 
      where: { code: gameCode },
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] }
        }
      ] 
    });

    res.send(updatedGame);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while joining the game."
    });
  }
};

exports.startGame = async (req, res) => {
  try {    const { gameId } = req.params;
    const { hostId } = req.body;

    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).send({
        message: `Game with ID ${gameId} not found.`
      });
    }    if (game.hostId !== hostId) {
      return res.status(403).send({
        message: "Only the host can start the game."
      });
    }    if (game.status !== 'waiting') {
      return res.status(400).send({
        message: "Game is already in progress or has ended."
      });
    }    game.status = 'in_progress';
    game.currentRound = 1;
    await game.save();
    await GameRound.create({
      gameId,
      roundNumber: 1,
      status: 'drawing',
      startTime: new Date()
    });

    res.send(game);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while starting the game."
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const data = await Game.findAll({
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] }
        }
      ]
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving games."
    });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Game.findByPk(id, {
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] }
        },
        {
          model: GameRound,
          as: 'rounds'
        }
      ]
    });
    
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Game with id=${id} was not found.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Game with id=${id}: ${err.message}`
    });
  }
};

exports.findByCode = async (req, res) => {
  const code = req.params.code;

  try {
    const data = await Game.findOne({ 
      where: { id: code },
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] }
        },
        {
          model: GameRound,
          as: 'rounds'
        }
      ] 
    });
    
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Game with code=${code} was not found.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Game with code=${code}: ${err.message}`
    });
  }
};

exports.endGameRound = async (req, res) => {
  try {    const { gameId, roundNumber } = req.params;

    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).send({
        message: `Game with ID ${gameId} not found.`
      });
    }    const currentRound = await GameRound.findOne({
      where: { 
        gameId,
        roundNumber: parseInt(roundNumber)
      }
    });

    if (!currentRound) {
      return res.status(404).send({
        message: `Round ${roundNumber} not found for game with ID ${gameId}.`
      });
    }    currentRound.status = 'completed';
    currentRound.endTime = new Date();
    await currentRound.save();
    if (parseInt(roundNumber) >= game.totalRounds) {
      game.status = 'completed';
      await game.save();
      
      return res.send({
        message: "Game completed successfully!",
        game
      });
    }    const nextRoundNumber = parseInt(roundNumber) + 1;
    game.currentRound = nextRoundNumber;
    await game.save();
    const nextRound = await GameRound.create({
      gameId,
      roundNumber: nextRoundNumber,
      status: 'drawing',
      startTime: new Date()
    });

    res.send({
      message: `Round ${roundNumber} completed, Round ${nextRoundNumber} started!`,
      currentRound,
      nextRound,
      game
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while processing the game round."
    });
  }
};
