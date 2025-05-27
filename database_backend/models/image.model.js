module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('image', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    roundId: {
      type: DataTypes.UUID,
      references: {
        model: 'gameRounds',
        key: 'id'
      }
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false
    },    originalDrawingUrl: {
      type: DataTypes.TEXT,
      allowNull: false
    },    enhancedImageUrl: {
      type: DataTypes.TEXT
    },
    votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: true
  });

  return Image;
};
