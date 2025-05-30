const db = require('../models');
const User = db.User;
const Game = db.Game;
const { Op } = db.Sequelize;

exports.create = async (req, res) => {
  try {
    if (!req.user.name || !req.user.email || !req.user.uid) {
      return res.status(400).send({
        message: "Content can't be empty!"
      });
    }
    // console.log(`Creating user with name: ${req.user.name}, email: ${req.user.email}, uid: ${req.user.uid}`);
    const user = {
      id: req.user.uid,  // Firebase UID as primary key
      username: req.user.name,
      email: req.user.email,
      profilePictureUrl: null,
    };

    const data = await User.create(user);
    
    res.status(201).send(data);
  } catch (err) {
    console.log(`Error creating user: ${err.message}`);
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
  const id = req.user.uid;
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
