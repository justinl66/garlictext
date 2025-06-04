const db = require('../models');
const Caption = db.Caption;
const Image = db.Image;
const User = db.User;
const Prompt = db.Prompt;
const { Op } = db.Sequelize;

exports.create = async (req, res) => {
  try {
    console.log(`📝 Caption creation attempt - User: ${req.user?.uid || 'unknown'}, Image: ${req.body.imageId || 'unknown'}`);
    
    if (!req.user || !req.user.uid) {
      console.log('❌ Caption creation failed: Authentication required');
      return res.status(401).send({
        message: "Authentication required"
      });
    }

    if (!req.body.imageId || !req.body.text || !req.body.roundId) {
      console.log('❌ Caption creation failed: Missing required fields');
      return res.status(400).send({
        message: "Content can't be empty! Required fields: imageId, text, roundId"
      });
    }

    const caption = {
      userId: req.user.uid,
      imageId: req.body.imageId,
      roundId: req.body.roundId,
      text: req.body.text
    };    const data = await Caption.create(caption);
    console.log(`✅ Caption created successfully - ID: ${data.id}, User: ${req.user.uid}, Image: ${req.body.imageId}, Round: ${req.body.roundId}`);
    res.status(201).send(data);
  } catch (err) {
    console.error(`❌ Caption creation error for user ${req.user?.uid}: ${err.message}`);
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Caption."
    });
  }
};

exports.findByImageId = async (req, res) => {
  const imageId = req.params.imageId;
  console.log(`🔍 Fetching captions for image - ID: ${imageId}`);

  try {
    const data = await Caption.findAll({
      where: { imageId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePictureUrl']
        },
        {
          model: Prompt,
          as: 'promptData',
          attributes: ['id', 'text']
        }
      ]
    });
    console.log(`✅ Found ${data.length} captions for image ${imageId}`);
    res.send(data);
  } catch (err) {
    console.error(`❌ Error fetching captions for image ${imageId}: ${err.message}`);
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving captions."
    });
  }
};

exports.findByRoundId = async (req, res) => {
  const roundId = req.params.roundId;
  console.log(`🔍 Fetching captions for round - ID: ${roundId}`);

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
          model: Prompt,
          as: 'promptData',
          attributes: ['id', 'text']
        },
        {
          model: Image,
          as: 'image'
        }
      ]
    });
    console.log(`✅ Found ${data.length} captions for round ${roundId}`);
    res.send(data);
  } catch (err) {
    console.error(`❌ Error fetching captions for round ${roundId}: ${err.message}`);
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving captions."
    });
  }
};

exports.vote = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗳️ Vote submitted for caption - ID: ${id}`);
    
    const caption = await Caption.findByPk(id);
    
    if (!caption) {
      console.log(`❌ Vote failed: Caption ID ${id} not found`);
      return res.status(404).send({
        message: `Caption with id=${id} was not found.`
      });
    }
    
    caption.votes += 1;
    await caption.save();
    
    console.log(`✅ Vote recorded successfully - Caption ID: ${id}, Total votes: ${caption.votes}`);
    res.send({
      message: "Vote added successfully!",
      caption
    });
  } catch (err) {
    console.error(`❌ Vote error for caption ${req.params.id}: ${err.message}`);
    res.status(500).send({
      message: err.message || "Some error occurred while processing the vote."
    });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  console.log(`🔍 Fetching single caption - ID: ${id}`);

  try {
    const data = await Caption.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePictureUrl']
        },
        {
          model: Prompt,
          as: 'promptData',
          attributes: ['id', 'text']
        },
        {
          model: Image,
          as: 'image'
        }
      ]
    });
    
    if (data) {
      console.log(`✅ Caption found - ID: ${id}, User: ${data.userId || 'unknown'}`);
      res.send(data);
    } else {
      console.log(`❌ Caption not found - ID: ${id}`);
      res.status(404).send({
        message: `Caption with id=${id} was not found.`
      });
    }
  } catch (err) {
    console.error(`❌ Error fetching caption ${id}: ${err.message}`);
    res.status(500).send({
      message: `Error retrieving Caption with id=${id}: ${err.message}`
    });
  }
};
