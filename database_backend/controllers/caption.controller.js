const db = require('../models');
const Caption = db.Caption;
const Image = db.Image;
const User = db.User;
const Prompt = db.Prompt;
const { Op } = db.Sequelize;

exports.create = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).send({
        message: "Authentication required"
      });
    }

    if (!req.body.imageId || !req.body.text || !req.body.roundId) {
      return res.status(400).send({
        message: "Content can't be empty! Required fields: imageId, text, roundId"
      });
    }

    const caption = {
      userId: req.user.uid,
      imageId: req.body.imageId,
      roundId: req.body.roundId,
      text: req.body.text
    };

    const data = await Caption.create(caption);
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
    console.error("Error in findByImageId:", err);
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
    console.error("Error in findByRoundId:", err);
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving captions."
    });
  }
};

exports.vote = async (req, res) => {
  try {
    const { id } = req.params;
    
    const caption = await Caption.findByPk(id);
    
    if (!caption) {
      return res.status(404).send({
        message: `Caption with id=${id} was not found.`
      });
    }
    
    caption.votes += 1;
    await caption.save();
    
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
    console.error(`Error in findOne for caption ${id}:`, err);
    res.status(500).send({
      message: `Error retrieving Caption with id=${id}: ${err.message}`
    });
  }
};
