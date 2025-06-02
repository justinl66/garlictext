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
    status: {
      type: DataTypes.ENUM('waiting', 'in_progress', 'completed'),
      defaultValue: 'waiting'
    },
    hostId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      defaultValue: 8
    },
    currentRound: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalRounds: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    }
  }, {
    timestamps: true
  });

  return Game;
};
