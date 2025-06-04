const db = require('../models');
const Game = db.Game;
const User = db.User;
const GameRound = db.GameRound;
const { Op } = db.Sequelize;

const generateGameCode = async (length = 6, forGame = true) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    let existingGame;
    if(forGame){
      existingGame = await Game.findByPk(code);
    }else{
      existingGame = await User.findByPk(code);
    }
    if (!existingGame) {
      isUnique = true;
    }
  }

  return code;
};
exports.create = async (req, res) => {
  // console.log("Creating game with request body:", req.body);
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
    }    
    const code = await generateGameCode();
    console.log("Generated game code:" , req.user.uid);
    const game = {
      id: code,
      name: req.body.name,
      hostId: req.user.uid,
      maxPlayers: req.body.maxPlayers || 8,
      totalRounds: req.body.totalRounds || 3
    };    const createdGame = await Game.create(game);
    
    const host = await User.findByPk(req.user.uid);
    if (host) {
      await createdGame.addParticipant(host);
    }

    return res.status(201).send({
      code:code
    });
  } catch (err) {
    console.error("Error creating game:", err.message);
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Game."
    });
  }
};

exports.update = async (req, res) => {
    try {
    const gameId = req.params.id;
    const game = await Game.findByPk(gameId);
    
    if (!game) {
      return res.status(404).send({
        message: `Game with ID ${gameId} not found.`
      });
    }
    if(game.hostId !== req.user.uid) {
      return res.status(403).send({
        message: "Only the host can update the game settings."
      });
    }
    if (req.body.maxPlayers) {
      game.maxPlayers = req.body.maxPlayers;
    }
    if (req.body.rounds) {
      game.totalRounds = req.body.rounds;
    }
    if (req.body.drawingTime) {
      game.drawingTime = req.body.drawingTime;
    }
    if (req.body.writingTime) {
      game.writingTime = req.body.writingTime;
    }
    game.updateNumber += 1; // Increment update number
    await game.save();
    res.status(200).send({
      message: "Game settings updated successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while updating the game settings."
    });
  }
}

exports.getLobbyInfo = async (req, res) => {
  try {
    const gameCode = req.params.code;
    const version = req.query.version;
    const game = await Game.findByPk(gameCode, {
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
    }

    
    if(!version){
      return res.status(400).send({
        message: "Version is required!"
      });
    }

    if(gameCode + game.updateNumber == version){
      return res.status(200).send({
        message: "good",
      })
    }

    if (game.status !== 'waiting') {
      return res.status(222).send({
        message: "Game is not in waiting status."
      });
    }

    players = game.participants.map(participant => ({
      id: participant.dataValues.id,
      name: participant.dataValues.username,
      avatar: participant.dataValues.profilePictureUrl,
      isReady:true
    }))

    // console.log("players:", players);

    const lobbyInfo = {
      message: "updated",
      name: game.name,
      satus: game.status,
      gameHost: game.hostId,
      maxPlayers: game.maxPlayers,
      players: players,
      rounds: game.totalRounds,
      drawingTime: game.drawingTime,
      writingTime: game.writingTime,
      currentUpdate: gameCode + game.updateNumber
    }
    

    return res.status(200).send(lobbyInfo);
  }catch (err) {
    return res.status(500).send({
      message: err.message || "Some error occurred while retrieving lobby information."
    });
  }
}


exports.joinGameWithAuth = async (req, res) => {
  try {
    if(!req.params.id){
      return res.status(400).send({
        message: "Game ID is required!"
      });
    }

    console.log("User ID from request:", req.user.uid);

    const newUser = await User.findByPk(req.user.uid);
    if (!newUser) {
      return res.status(404).send({
        message: `User with ID ${req.user.uid} not found.`
      });
    }

    const username = newUser.dataValues.username;

    const game = await Game.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] }
        }
      ]
    });

    console.log("Game found:", game ? game.id : "No game found");

    if (!game) {
      return res.status(404).send({
        message: `Game with ID ${req.params.id} not found.`
      });
    }

    if (game.participants.length >= game.maxPlayers) {
      return res.status(400).send({
        message: "Game is already full."
      });
    }

    console.log("Game status:", game.status);

    if (game.status !== 'waiting') {
      return res.status(400).send({
        message: "Cannot join game that is already in progress."
      });
    }

    for (const participant of game.participants) {
      if (participant.id === req.user.uid) {
        return res.status(400).send({
          message: "User is already in this game."
        });
      }

      console.log("Checking participant:", participant.username);

      if(participant.username === username){
        return res.status(400).send({
          message: "Username already exists in this game."
        });
      }
    }

    console.log("Adding user to game:", username);

    await game.addParticipant(newUser);
    game.updateNumber += 1; // Increment update number
    await game.save();

    return res.status(200).send({
      message: "User successfully joined the game.",
    })

    
  }catch (err) {
    return res.status(500).send({
      message: err.message || "Some error occurred while authenticating the user."
    });
  }
}

exports.joinGameNoAuth = async (req, res) => {
  try {
    if (!req.body.playerName) {
      return res.status(400).send({
        message: "User ID required!"
      });
    }    
    if (!req.params.id) {
      return res.status(400).send({
        message: "Game ID is required!"
      });
    }

    let name = req.body.playerName;

      const game = await Game.findByPk(req.params.id, {
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
        message: `Game with ID ${req.params.id} not found.`
      });
    }
    if (game.participants.length >= game.maxPlayers) {
      return res.status(400).send({
        message: "Game is already full."
      });
    }
    if (game.status !== 'waiting') {
      return res.status(400).send({
        message: "Cannot join game that is already in progress."
      });
    }
    for (const participant of game.participants) {
      if(participant.username === name){
        return res.status(400).send({
          message: "Username already exists in this game."
        });
      }
    }

    const newUserId = await generateGameCode(28, false);
    const newUser = {
      id: newUserId,
      username: name,
      email:`${newUserId}@gartictext.com`,
      profilePictureUrl: null,
    }

    const user = await User.create(newUser);
    if (!user) {
      return res.status(500).send({
        message: "Failed to create user for joining the game."
      });
    }

    await game.addParticipant(user);
    game.updateNumber += 1; // Increment update number
    await game.save();

    return res.status(200).send({
      message: "User successfully joined the game without authentication.",
      id: newUserId,
    });

  }catch (err) {
    return res.status(500).send({
      message: err.message || "Some error occurred while joining the game without authentication."
    });
  }
}

exports.leaveGameWithAuth = async (req, res) => {
  try {
    if(!req.params.id){
      return res.status(400).send({
        message: "Game ID is required!"
      });
    }

    const game = await Game.findByPk(req.params.id, {
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
        message: `Game with ID ${req.params.id} not found.`
      });
    }

    const user = await User.findByPk(req.user.uid);
    if (!user) {
      return res.status(404).send({
        message: `User with ID ${req.user.uid} not found.`
      });
    }

    const isParticipant = game.dataValues.participants.some(participant => participant.id === req.user.uid);
    if (!isParticipant) {
      return res.status(400).send({
        message: "User is not a participant in this game."
      });
    }

    if(game.dataValues.hostId === req.user.uid){
      await game.destroy();
    }else{
      await game.removeParticipant(user);
    }

    game.updateNumber += 1; // Increment update number
    await game.save();

    return res.status(200).send({
      message: "User successfully left the game.",
    });

  }catch(error){
    return res.status(500).send({
      message: error.message || "Some error occurred while leaving the game."
    });
  }
}

exports.leaveGameNoAuth = async (req, res) => {
  try {
    if (!req.body.userId || !req.params.id) {
      return res.status(400).send({
        message: "User ID and game ID are required!"
      });
    }
    const userId = req.body.userId;
    const game = await Game.findByPk(req.params.id, {
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
        message: `Game with ID ${req.params.id} not found.`
      });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({
        message: `User with ID ${userId} not found.`
      });
    }
    const isParticipant = game.dataValues.participants.some(participant => participant.id === userId);
    if (!isParticipant) {
      return res.status(400).send({
        message: "User is not a participant in this game."
      });
    }

    await game.removeParticipant(user);
    game.updateNumber += 1; // Increment update number
    await game.save()

    return res.status(200).send({
      message: "User successfully left the game.",
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message || "Some error occurred while leaving the game."
    });
  }
}

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
