module.exports = (sequelize, DataTypes) => {
  const Prompt = sequelize.define('prompt', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creatorId: {
      type: DataTypes.STRING,
      references: {
        model: 'users',
        key: 'id'
      }
    },    roundId: {
      type: DataTypes.STRING(6), // Use roomId instead of roundId - 6 digit lobby code
      allowNull: true, // Make optional since we're simplifying
      references: {
        model: 'games',
        key: 'id'
      }
    },
    assignedToId: {
      type: DataTypes.STRING,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  return Prompt;
};