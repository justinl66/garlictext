const db = require('../models');
const Image = db.Image;
const User = db.User;
const Caption = db.Caption;
const Game = db.Game;
const { Op } = db.Sequelize;

exports.create = async (req, res) => {  
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(401).send({
        message: "Authentication required"
      });
    }

    if (!req.body.prompt || !req.body.originalDrawingData) {
      return res.status(400).send({
        message: "Content can't be empty! Required fields: prompt, originalDrawingData"
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
      userId: userId,
      roundId: req.body.roundId && req.body.roundId !== 'null' ? req.body.roundId : null,
      prompt: req.body.prompt,
      originalDrawingData: originalDrawingBuffer,
      originalDrawingMimeType: mimeType,
      enhancedImageData: req.body.enhancedImageData ? Buffer.from(req.body.enhancedImageData, 'base64') : null,
      enhancedImageMimeType: req.body.enhancedImageMimeType || 'image/png'
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
    }      image.enhancedImageData = enhancedImageBuffer;
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
        }      ]
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
    const rating = req.body && req.body.rating ? parseInt(req.body.rating, 10) : 1;
    
    const image = await Image.findByPk(id);
    
    if (!image) {
      return res.status(404).send({
        message: `Image with id=${id} was not found.`
      });
    }
    
    image.votes += rating;
    await image.save();
    
    res.send({
      message: `Vote added successfully with rating ${rating}!`,
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
      ]    });
    
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
      'Cache-Control': 'public, max-age=86400'
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
      'Cache-Control': 'public, max-age=86400'
    });
    
    res.send(image.enhancedImageData);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving enhanced image with id=${id}: ${err.message}`
    });
  }
};

exports.getLatestImage = async (req, res) => {
  try {
    const data = await Image.findOne({
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
      ],
      order: [['createdAt', 'DESC']]
    });
    
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No images found in database.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving latest image: ${err.message}`
    });
  }
};

exports.updateCaptionedImage = async (req, res) => {
  const id = req.params.id;
  
  try {
    if (!req.body.captionedImageData) {
      return res.status(400).send({
        message: "captionedImageData is required"
      });
    }

    const image = await Image.findByPk(id);
    if (!image) {
      return res.status(404).send({
        message: `Image with id=${id} was not found.`
      });
    }
    
    let captionedImageBuffer;
    let mimeType = 'image/png';
    
    if (req.body.captionedImageData.startsWith('data:')) {
      const matches = req.body.captionedImageData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        captionedImageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        return res.status(400).send({
          message: "Invalid data URL format for captionedImageData"
        });
      }
    } else {
      captionedImageBuffer = Buffer.from(req.body.captionedImageData, 'base64');
      mimeType = req.body.captionedImageMimeType || 'image/png';
    }
      image.captionedImageData = captionedImageBuffer;
    image.captionedImageMimeType = mimeType;
    
    await image.save();
    
    res.send({
      message: "Captioned image updated successfully.",
      imageId: id
    });
    
  } catch (err) {
    res.status(500).send({
      message: `Error updating captioned image with id=${id}: ${err.message}`
    });
  }
};

exports.getCaptionedImage = async (req, res) => {
  const id = req.params.id;
  
  try {
    const image = await Image.findByPk(id);
    
    if (!image || !image.captionedImageData) {
      return res.status(404).send({
        message: `Captioned image with id=${id} was not found.`
      });
    }
    
    res.set({
      'Content-Type': image.captionedImageMimeType || 'image/png',
      'Cache-Control': 'public, max-age=86400'
    });
    
    res.send(image.captionedImageData);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving captioned image with id=${id}: ${err.message}`
    });
  }
};

exports.getAssignedImageForUser = async (req, res) => {
  try {
    const userId = req.query.userId;
    const gameId = req.params.gameId || req.body.gameId;

    if (!userId || !gameId) {
      return res.status(400).send({
        message: "User ID and game ID are required"
      });
    }
    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] },
          include: [
            {
              model: Image,
              as: 'images',
              where: { roundId: gameId },
              required: false,
              include: [
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
            }
          ]
        }
      ]
    });

    if (!game) {
      return res.status(404).send({
        message: `Game with ID ${gameId} not found.`
      });
    }    
    const participants = game.participants.sort((a, b) => a.id.localeCompare(b.id));
    const participantCount = participants.length;

    if (participantCount === 0) {
      return res.status(400).send({
        message: "No participants found in the game"
      });
    }

    const currentUserIndex = participants.findIndex(p => p.id === userId);
    
    if (currentUserIndex === -1) {
      return res.status(400).send({
        message: "User is not a participant in this game"
      });
    }    let assignedImageOwnerIndex;
    
    if (participantCount === 1) {
      assignedImageOwnerIndex = currentUserIndex;
    } else if (participantCount === 2) {
      assignedImageOwnerIndex = currentUserIndex === 0 ? 1 : 0;
    } else {
      assignedImageOwnerIndex = (currentUserIndex + 1) % participantCount;
    }

    const assignedImageOwner = participants[assignedImageOwnerIndex];
    
    const assignedImage = assignedImageOwner.images.find(img => img.roundId === gameId);

    if (!assignedImage) {
      return res.status(404).send({
        message: `No image found for assigned user ${assignedImageOwner.username} in this round`
      });
    }

    const existingCaption = assignedImage.captions.find(caption => caption.userId === userId);
    
    if (existingCaption) {
      return res.status(200).send({
        image: assignedImage,
        alreadyCaptioned: true,
        existingCaption: existingCaption
      });
    }

    res.status(200).send({
      image: assignedImage,
      alreadyCaptioned: false,
      assignedTo: {
        id: assignedImageOwner.id,
        username: assignedImageOwner.username
      }
    });
    
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving assigned image."
    });
  }
};
