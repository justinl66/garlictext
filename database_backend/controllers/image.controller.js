const db = require('../models');
const Image = db.Image;
const User = db.User;
const Caption = db.Caption;
const { Op } = db.Sequelize;

exports.create = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.prompt || !req.body.originalDrawingData) {
      return res.status(400).send({
        message: "Content can't be empty! Required fields: userId, prompt, originalDrawingData"
      });
    }

    let originalDrawingBuffer;
    let mimeType = 'image/png';
    
    if (req.body.originalDrawingData.startsWith('data:')) {
      const matches = req.body.originalDrawingData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        originalDrawingBuffer = Buffer.from(matches[2], 'base64');
      } else {
        return res.status(400).send({
          message: "Invalid data URL format for originalDrawingData"
        });
      }
    } else {
      originalDrawingBuffer = Buffer.from(req.body.originalDrawingData, 'base64');
    }    const image = {
      userId: req.body.userId,
      roundId: req.body.roundId || null,
      prompt: req.body.prompt,
      originalDrawingData: originalDrawingBuffer,
      originalDrawingMimeType: mimeType,
      enhancedImageData: req.body.enhancedImageData ? Buffer.from(req.body.enhancedImageData, 'base64') : null,
      enhancedImageMimeType: req.body.enhancedImageMimeType || 'image/png'
    };

    const data = await Image.create(image);
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
    if (!req.body.enhancedImageData) {
      return res.status(400).send({
        message: "Enhanced image data is required!"
      });
    }

    const image = await Image.findByPk(id);
    
    if (!image) {
      return res.status(404).send({
        message: `Image with id=${id} was not found.`
      });
    }
    
    let enhancedImageBuffer;
    let mimeType = 'image/png';
    
    if (req.body.enhancedImageData.startsWith('data:')) {
      const matches = req.body.enhancedImageData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        enhancedImageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        return res.status(400).send({
          message: "Invalid data URL format for enhancedImageData"
        });
      }
    } else {
      enhancedImageBuffer = Buffer.from(req.body.enhancedImageData, 'base64');
      mimeType = req.body.enhancedImageMimeType || 'image/png';
    }
    
    image.enhancedImageData = enhancedImageBuffer;
    image.enhancedImageMimeType = mimeType;
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

exports.getOriginalImage = async (req, res) => {
  const id = req.params.id;

  try {
    const image = await Image.findByPk(id, {
      attributes: ['originalDrawingData', 'originalDrawingMimeType']
    });
    
    if (!image || !image.originalDrawingData) {
      return res.status(404).send({
        message: `Original image with id=${id} was not found.`
      });
    }
    
    res.set({
      'Content-Type': image.originalDrawingMimeType || 'image/png',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    });
    
    res.send(image.originalDrawingData);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving original image with id=${id}: ${err.message}`
    });
  }
};

exports.getEnhancedImage = async (req, res) => {
  const id = req.params.id;

  try {
    const image = await Image.findByPk(id, {
      attributes: ['enhancedImageData', 'enhancedImageMimeType']
    });
    
    if (!image || !image.enhancedImageData) {
      return res.status(404).send({
        message: `Enhanced image with id=${id} was not found.`
      });
    }
    
    res.set({
      'Content-Type': image.enhancedImageMimeType || 'image/png',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    });
    
    res.send(image.enhancedImageData);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving enhanced image with id=${id}: ${err.message}`
    });
  }
};
