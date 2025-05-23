module.exports = (sequelize, DataTypes) => {
  const GameRound = sequelize.define('gameRound', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    gameId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    roundNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'drawing', 'captioning', 'voting', 'completed'),
      defaultValue: 'pending'
    },
    startTime: {
      type: DataTypes.DATE
    },
    endTime: {
      type: DataTypes.DATE
    }
  }, {
    timestamps: true
  });

  return GameRound;
};
