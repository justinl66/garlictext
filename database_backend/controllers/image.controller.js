const db = require('../models');
const Image = db.Image;
const User = db.User;
const Caption = db.Caption;
const { Op } = db.Sequelize;

exports.create = async (req, res) => {  try {
    if (!req.body.userId || !req.body.prompt || !req.body.originalDrawingUrl || !req.body.roundId) {
      return res.status(400).send({
        message: "Content can't be empty! Required fields: userId, prompt, originalDrawingUrl, roundId"
      });
    }    const image = {
      userId: req.body.userId,
      roundId: req.body.roundId,
      prompt: req.body.prompt,
      originalDrawingUrl: req.body.originalDrawingUrl,
      enhancedImageUrl: req.body.enhancedImageUrl || null
    };    const data = await Image.create(image);
    res.status(201).send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Image."
    });
  }
};

exports.updateEnhanced = async (req, res) => {
  const id = req.params.id;

  try {
    if (!req.body.enhancedImageUrl) {
      return res.status(400).send({
        message: "Enhanced image URL is required!"
      });
    }

    const image = await Image.findByPk(id);
    
    if (!image) {
      return res.status(404).send({
        message: `Image with id=${id} was not found.`
      });
    }
    
    image.enhancedImageUrl = req.body.enhancedImageUrl;
    await image.save();
    
    res.send({
      message: "Enhanced image was updated successfully.",
      image
    });
  } catch (err) {
    res.status(500).send({
      message: `Error updating enhanced image with id=${id}: ${err.message}`
    });
  }
};

exports.findByRoundId = async (req, res) => {
  const roundId = req.params.roundId;

  try {
    const data = await Image.findAll({
      where: { roundId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePictureUrl']
        },
        {
          model: Caption,
          as: 'captions',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profilePictureUrl']
            }
          ]
        }
      ]
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving images."
    });
  }
};

exports.vote = async (req, res) => {
  try {
    const { id } = req.params;
    
    const image = await Image.findByPk(id);
    
    if (!image) {
      return res.status(404).send({
        message: `Image with id=${id} was not found.`
      });
    }
    
    image.votes += 1;
    await image.save();
    
    res.send({
      message: "Vote added successfully!",
      image
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
    const data = await Image.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePictureUrl']
        },
        {
          model: Caption,
          as: 'captions',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profilePictureUrl']
            }
          ]
        }
      ]
    });
    
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Image with id=${id} was not found.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Image with id=${id}: ${err.message}`
    });
  }
};
