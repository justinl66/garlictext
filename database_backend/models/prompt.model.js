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
      type: DataTypes.STRING(6),
      allowNull: true,
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