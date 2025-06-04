module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define('game', {
    id: {
      type: DataTypes.STRING(6),
      allowNull: false,
      unique: true,
      primaryKey: true,
      validate: {
        len: [6, 6]
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hostId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('lobby', 'prompting', 'drawing', 'captioning', 'voting', 'trophies'),
      defaultValue: 'lobby'
    },

    prompterId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    promptString:{
      type: DataTypes.STRING,
      allowNull: true,
    },

    maxPlayers: {
      type: DataTypes.INTEGER,
      defaultValue: 8
    },
    drawingTime: {
      type: DataTypes.INTEGER,
      defaultValue: 60
    },
    writingTime: {
      type: DataTypes.INTEGER,
      defaultValue: 60
    },
    currentRound: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalRounds: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    updateNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
  }, {
    timestamps: true
  });

  return Game;
};
