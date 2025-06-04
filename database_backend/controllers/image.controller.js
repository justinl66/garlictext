const db = require('../models');
const Image = db.Image;
const User = db.User;
const Caption = db.Caption;
const { Op } = db.Sequelize;

exports.create = async (req, res) => {
  try {
    console.log(`📸 Image creation attempt - User: ${req.user?.uid || 'unknown'}`);
    
    if (!req.user || !req.user.uid) {
      console.log('❌ Image creation failed: Authentication required');
      return res.status(401).send({
        message: "Authentication required"
      });
    }

    if (!req.body.prompt || !req.body.originalDrawingData) {
      console.log('❌ Image creation failed: Missing required fields');
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
    }

    const image = {
      userId: req.user.uid,
      roundId: req.body.roundId || null,
      prompt: req.body.prompt,
      originalDrawingData: originalDrawingBuffer,
      originalDrawingMimeType: mimeType,
      enhancedImageData: req.body.enhancedImageData ? Buffer.from(req.body.enhancedImageData, 'base64') : null,
      enhancedImageMimeType: req.body.enhancedImageMimeType || 'image/png'
    };    const data = await Image.create(image);
    console.log(`✅ Image created successfully - ID: ${data.id}, User: ${req.user.uid}, Round: ${req.body.roundId || 'none'}`);
    res.status(201).send(data);
  } catch (err) {
    console.error(`❌ Image creation error for user ${req.user?.uid}: ${err.message}`);
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Image."
    });
  }
};

exports.updateEnhanced = async (req, res) => {
  const id = req.params.id;
  console.log(`🔧 Updating enhanced image - ID: ${id}`);

  try {
    if (!req.body.enhancedImageData) {
      console.log(`❌ Enhanced image update failed for ID ${id}: Missing enhanced image data`);
      return res.status(400).send({
        message: "Enhanced image data is required!"
      });
    }

    const image = await Image.findByPk(id);
    
    if (!image) {
      console.log(`❌ Enhanced image update failed: Image ID ${id} not found`);
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
    
    console.log(`✅ Enhanced image updated successfully - ID: ${id}`);
    res.send({
      message: "Enhanced image was updated successfully.",
      image
    });
  } catch (err) {
    console.error(`❌ Enhanced image update error for ID ${id}: ${err.message}`);
    res.status(500).send({
      message: `Error updating enhanced image with id=${id}: ${err.message}`
    });
  }
};

exports.findByRoundId = async (req, res) => {
  const roundId = req.params.roundId;
  console.log(`🔍 Fetching images for round - ID: ${roundId}`);

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
    console.log(`✅ Found ${data.length} images for round ${roundId}`);
    res.send(data);
  } catch (err) {
    console.error(`❌ Error fetching images for round ${roundId}: ${err.message}`);
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving images."
    });
  }
};

exports.vote = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗳️ Vote submitted for image - ID: ${id}`);
    
    const image = await Image.findByPk(id);
    
    if (!image) {
      console.log(`❌ Vote failed: Image ID ${id} not found`);
      return res.status(404).send({
        message: `Image with id=${id} was not found.`
      });
    }
    
    image.votes += 1;
    await image.save();
    
    console.log(`✅ Vote recorded successfully - Image ID: ${id}, Total votes: ${image.votes}`);
    res.send({
      message: "Vote added successfully!",
      image
    });
  } catch (err) {
    console.error(`❌ Vote error for image ${req.params.id}: ${err.message}`);
    res.status(500).send({
      message: err.message || "Some error occurred while processing the vote."
    });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  console.log(`🔍 Fetching single image - ID: ${id}`);

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
      console.log(`✅ Image found - ID: ${id}, User: ${data.userId || 'unknown'}`);
      res.send(data);
    } else {
      console.log(`❌ Image not found - ID: ${id}`);
      res.status(404).send({
        message: `Image with id=${id} was not found.`
      });
    }
  } catch (err) {
    console.error(`❌ Error fetching image ${id}: ${err.message}`);
    res.status(500).send({
      message: `Error retrieving Image with id=${id}: ${err.message}`
    });
  }
};

exports.getOriginalImage = async (req, res) => {
  const id = req.params.id;
  console.log(`🖼️ Serving original image - ID: ${id}`);

  try {
    const image = await Image.findByPk(id, {
      attributes: ['originalDrawingData', 'originalDrawingMimeType']
    });
    
    if (!image || !image.originalDrawingData) {
      console.log(`❌ Original image not found - ID: ${id}`);
      return res.status(404).send({
        message: `Original image with id=${id} was not found.`
      });
    }
    
    console.log(`✅ Original image served - ID: ${id}, Type: ${image.originalDrawingMimeType || 'image/png'}`);
    res.set({
      'Content-Type': image.originalDrawingMimeType || 'image/png',
      'Cache-Control': 'public, max-age=86400'
    });
    
    res.send(image.originalDrawingData);
  } catch (err) {
    console.error(`❌ Error serving original image ${id}: ${err.message}`);
    res.status(500).send({
      message: `Error retrieving original image with id=${id}: ${err.message}`
    });
  }
};

exports.getEnhancedImage = async (req, res) => {
  const id = req.params.id;
  console.log(`🎨 Serving enhanced image - ID: ${id}`);

  try {
    const image = await Image.findByPk(id, {
      attributes: ['enhancedImageData', 'enhancedImageMimeType']
    });
    
    if (!image || !image.enhancedImageData) {
      console.log(`❌ Enhanced image not found - ID: ${id}`);
      return res.status(404).send({
        message: `Enhanced image with id=${id} was not found.`
      });
    }
    
    console.log(`✅ Enhanced image served - ID: ${id}, Type: ${image.enhancedImageMimeType || 'image/png'}`);
    res.set({
      'Content-Type': image.enhancedImageMimeType || 'image/png',
      'Cache-Control': 'public, max-age=86400'
    });
    
    res.send(image.enhancedImageData);
  } catch (err) {
    console.error(`❌ Error serving enhanced image ${id}: ${err.message}`);
    res.status(500).send({
      message: `Error retrieving enhanced image with id=${id}: ${err.message}`
    });
  }
};

exports.getLatestImage = async (req, res) => {
  console.log(`🔍 Fetching latest image`);

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
      console.log(`✅ Latest image found - ID: ${data.id}, User: ${data.userId || 'unknown'}`);
      res.send(data);
    } else {
      console.log(`❌ No images found`);
      res.status(404).send({
        message: `No images found in database.`
      });
    }
  } catch (err) {
    console.error(`❌ Error fetching latest image: ${err.message}`);
    res.status(500).send({
      message: `Error retrieving latest image: ${err.message}`
    });
  }
};
