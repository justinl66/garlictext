const db = require('../models');
const Caption = db.Caption;
const Image = db.Image;
const User = db.User;
const Prompt = db.Prompt;
const Game = db.Game;
const { Op } = db.Sequelize;

exports.create = async (req, res) => {
  try {
    const uid = req.body.userId
    if (!uid) {
      return res.status(401).send({
        message: "User ID required"
      });
    }

    if (!req.body.imageId || !req.body.text || !req.body.roundId) {
      return res.status(400).send({
        message: "Content can't be empty! Required fields: imageId, text, roundId"
      });
    }

    const caption = {
      userId: uid,
      imageId: req.body.imageId,
      roundId: req.body.roundId,
      text: req.body.text    };

    const data = await Caption.create(caption);
    
    if (req.body.roundId) {
      const game = await Game.findByPk(req.body.roundId, {
        include: [
          { 
            model: User,
            as: 'participants',
            attributes: ['id']
          }
        ]
      });
      if (game) {
        game.submittedCaptions = game.submittedCaptions + 1;
        if(game.submittedCaptions >= game.participants.length) {
          game.status = 'voting';
          game.updateNumber = game.updateNumber + 1;
        }
        await game.save();
      }
    }
    
    res.status(201).send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Caption."
    });
  }
};

exports.findByImageId = async (req, res) => {
  const imageId = req.params.imageId;

  try {
    const data = await Caption.findAll({
      where: { imageId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePictureUrl']
        }
      ]
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving captions."
    });
  }
};

exports.findByRoundId = async (req, res) => {
  const roundId = req.params.roundId;

  try {
    const data = await Caption.findAll({
      where: { roundId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePictureUrl']
        },
        {
          model: Image,
          as: 'image'
        }
      ]    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving captions."
    });
  }
};

exports.vote = async (req, res) => {
  try {
    const { id } = req.params;
    const rating = req.body && req.body.rating ? parseInt(req.body.rating, 10) : 1;
    
    const caption = await Caption.findByPk(id);
    
    if (!caption) {
      return res.status(404).send({
        message: `Caption with id=${id} was not found.`
      });
    }
      caption.votes += rating;
    await caption.save();
    
    if (req.body.isLastVote && caption.roundId) {
      const game = await Game.findByPk(caption.roundId, {
        include: [
          { 
            model: User,
            as: 'participants',
            attributes: ['id']
          }
        ]
      });
      if (game) {
        game.votingDoneCount = game.votingDoneCount + 1;
        if (game.votingDoneCount >= game.participants.length) {
          game.status = 'trophies';
          game.updateNumber = game.updateNumber + 1;
        }
        await game.save();
      }
    }
    
    res.send({
      message: "Vote added successfully!",
      caption
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while processing the vote."
    });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Caption.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePictureUrl']
        },
        {
          model: Image,
          as: 'image'
        }
      ]
    });
    
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Caption with id=${id} was not found.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Caption with id=${id}: ${err.message}`
    });
  }
};
