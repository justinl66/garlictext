const db = require('../models');
const Game = db.Game;
const User = db.User;
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
    }      const code = await generateGameCode();
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
      code:code    });
  } catch (err) {
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
          through: { attributes: [] },
          attributes: ['id', 'username', 'profilePictureUrl'], //avatar
        },
      ],
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

    // if (game.status !== 'lobby') {
    //   return res.status(222).send({
    //     message: "Game is not in lobby status."
    //   });
    // }

    const players = game.participants.map((participant) => ({
      id: participant.dataValues.id,
      name: participant.dataValues.username,
      avatar: participant.dataValues.profilePictureUrl || '/defaultAvatar.png', // use default if no avatar
      isReady: true,
    }));

    const lobbyInfo = {
      message: "updated",
      name: game.name,
      status: game.status,
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
};

exports.joinGameWithAuth = async (req, res) => {
  try {
    if(!req.params.id){
      return res.status(400).send({
        message: "Game ID is required!"
      });    }

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
      ]    });

    if (!game) {
      return res.status(404).send({
        message: `Game with ID ${req.params.id} not found.`
      });
    }

    if (game.participants.length >= game.maxPlayers) {
      return res.status(400).send({
        message: "Game is already full."
      });    }

    if (game.status !== 'lobby') {
      return res.status(400).send({
        message: "Cannot join game that is already in progress."
      });
    }

    for (const participant of game.participants) {
      if (participant.id === req.user.uid) {
        return res.status(400).send({
          message: "User is already in this game."
        });      }

      if(participant.username === username){
        return res.status(400).send({
          message: "Username already exists in this game."
        });
      }    }

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
    if (game.status !== 'lobby') {
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
    }    if (game.status !== 'lobby') {
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
  try {    
    const { gameId } = req.params;
    const { uid } = req.user;

    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: User,
          as: 'participants',
          attributes:["id"]
        }
      ]
    });
    if (!game) {
      return res.status(404).send({
        message: `Game with ID ${gameId} not found.`
      });
    }    
    if (game.hostId !== uid) {
      return res.status(403).send({
        message: "Only the host can start the game."
      });
    }    
    if (game.status !== 'lobby') {
      return res.status(400).send({
        message: "Game is already in progress or has ended."
      });
    }    if(game.participants.length < 1) {
      return res.status(400).send({
        message: "At least 1 player is required to start the game."
      });
    }

    game.prompterId = game.participants[Math.floor(Math.random() * (game.participants.length))].id;
    // Simplified game start - no longer creating GameRound records
    game.status = 'prompting';

    game.currentRound = 1;
    game.updateNumber += 1; // Increment update number
    await game.save();

    res.status(200).send({
      message: "Game started successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while starting the game."
    });
  }
};

exports.getPromptInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const version = req.query.version;

    if (!id) {
      return res.status(400).send({
        message: "Game ID is required!"
      });
    }
    if (!version) {
      return res.status(400).send({
        message: "Version is required!"
      });
    }

    const game = await Game.findByPk(id);
    if (!game) {
      return res.status(404).send({
        message: `Game with ID ${id} not found.`
      });
    }    if(id + game.updateNumber == version) {
      return res.status(200).send({
        message: "good",
      });
    }

    return res.status(200).send({
      message: "updated",
      prompterId: game.prompterId,
      status: game.status,
      currentUpdate: game.id + game.updateNumber,
    });
    

  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving the prompt info."
    });
  }
};

exports.updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { promptString } = req.body;
    if (!id) {
      return res.status(400).send({
        message: "Game ID is required!"
      });
    }
    if (!promptString) {
      return res.status(400).send({
        message: "Prompt string is required!"
      });
    }
    const game = await Game.findByPk(id);
    if (!game) {
      return res.status(404).send({
        message: `Game with ID ${id} not found.`
      });
    }
    if (game.status !== 'prompting') {
      return res.status(400).send({
        message: "Game is not in prompting status."
      });
    }

    game.promptString = promptString;
    game.status = 'drawing';
    game.updateNumber += 1; // Increment update number
    await game.save();
    res.status(200).send({
      message: "Prompt updated successfully!",
    });
  }catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while updating the prompt."
    });
  }
};

exports.getPromptString = async (req, res) => {
  try {
    const { gameId } = req.params;
  }catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving the prompt string."
    });
  }
};

exports.query = async (req, res) => {
  const { name, maxPlayers, rounds, hideFull } = req.query;

  try {
    const whereClause = {
      status: 'lobby' // Default filter: only 'lobby' games are queryable
    };
    const includeClause = [];

    if (name) {
      // Using Op.iLike for case-insensitive search (PostgreSQL specific)
      whereClause.name = { [Op.iLike]: `%${name}%` };
    }

    if (maxPlayers) {
      const numMaxPlayers = parseInt(maxPlayers);
      if (!isNaN(numMaxPlayers) && numMaxPlayers > 0) {
        whereClause.maxPlayers = numMaxPlayers;
      }
    }

    if (rounds) {
      const numRounds = parseInt(rounds);
      if (!isNaN(numRounds) && numRounds > 0) {
        whereClause.totalRounds = numRounds;
      }
    }

    // Attributes to select from the Game model to be economical
    const gameAttributes = ['id', 'name', 'hostId', 'maxPlayers', 'totalRounds', 'status'];

    // Include participants to count them.
    // This is necessary to determine current player count and if the game is full.
    includeClause.push({
      model: User,
      as: 'participants', // This 'as' must match the association in models/index.js
      attributes: ['id'], // Fetching only 'id' is economical for counting
      through: { attributes: [] } // Don't need attributes from the GameParticipants join table
    });

    const games = await Game.findAll({
      attributes: gameAttributes,
      where: whereClause,
      include: includeClause,
      order: [['createdAt', 'DESC']] // Show newest games first
    });

    // Transform the games to match the frontend's expected structure
    // and perform calculations like current player count and isFull status.
    // let resultGames = await games.map((game) => {
    //   const participantsCount = game.participants ? game.participants.length : 0;
    //   // const host = await User.findByPk(game.hostId);
    //   return {
    //     id: game.id,
    //     name: game.name,
    //     host: game.hostId, // Frontend's 'Game' interface has 'host: string'. Assuming hostId.
    //     players: participantsCount,
    //     maxPlayers: game.maxPlayers,
    //     rounds: game.totalRounds,
    //     isFull: participantsCount >= game.maxPlayers,
    //     // status: game.status // Could be useful for frontend, but not in current Game interface in FindGame.tsx
    //   };
    // });

    let resultGames = []
    for (const game of games) {
      const participantsCount = game.participants ? game.participants.length : 0;
      const isFull = participantsCount >= game.maxPlayers;
      if(hideFull === 'true' && isFull) {
        continue; // Skip full games if hideFull is true
      }

      const host = await User.findByPk(game.hostId);

      resultGames.push({
        id: game.id,
        name: game.name,
        host: host.username, // Assuming hostId is sufficient for the frontend's 'host' field
        players: participantsCount,
        maxPlayers: game.maxPlayers,
        rounds: game.totalRounds,
        isFull: isFull,
        status: game.status // Including status for potential future use
      });
    }

    // Filter for hideFull if the flag is set to 'true'
    if (hideFull === 'true') {
      resultGames = resultGames.filter(game => !game.isFull);
    }

    res.status(200).send(resultGames);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while querying games."
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

  try {    const data = await Game.findByPk(id, {
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] }
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

  try {    const data = await Game.findOne({ 
      where: { id: code },
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] }
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

exports.endGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).send({
        message: `Game with ID ${gameId} not found.`
      });
    }

    // Simplified game ending - no longer dealing with multiple rounds
    game.status = 'completed';
    await game.save();
    
    res.send({
      message: "Game completed successfully!",
      game
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while ending the game."
    });
  }
};
