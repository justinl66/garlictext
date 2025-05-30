const db = require('../models');
const User = db.User;
const Game = db.Game;
const { Op } = db.Sequelize;

exports.create = async (req, res) => {
  try {
    if (!req.body.username || !req.body.email || !req.body.firebaseUid) {
      console.log(req.body.username);
      return res.status(400).send({
        message: "Content can't be empty!"
      });
    }

    const user = {
      username: req.body.username,
      email: req.body.email,
      firebaseUid: req.body.firebaseUid,
      profilePictureUrl: req.body.profilePictureUrl || null
    };
    const data = await User.create(user);
    res.status(201).send(data);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({
        message: "User with this email or username already exists."
      });
    }
    res.status(500).send({
      message: err.message || "Some error occurred while creating the User."
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const data = await User.findAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving users."
    });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await User.findByPk(id, {
      include: [
        {
          model: Game,
          as: 'games',
          through: { attributes: [] }
        }
      ]
    });
    
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `User with id=${id} was not found.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving User with id=${id}: ${err.message}`
    });
  }
};

exports.findByFirebaseUid = async (req, res) => {
  const firebaseUid = req.params.firebaseUid;

  try {
    const data = await User.findOne({ 
      where: { firebaseUid },
      include: [
        {
          model: Game,
          as: 'games',
          through: { attributes: [] }
        }
      ] 
    });
    
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `User with firebaseUid=${firebaseUid} was not found.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving User with firebaseUid=${firebaseUid}: ${err.message}`
    });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await User.update(req.body, {
      where: { id }
    });
    
    if (num[0] === 1) {
      res.send({
        message: "User was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error updating User with id=${id}: ${err.message}`
    });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await User.destroy({
      where: { id }
    });
    
    if (num === 1) {
      res.send({
        message: "User was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete User with id=${id}. Maybe User was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Could not delete User with id=${id}: ${err.message}`
    });
  }
};
