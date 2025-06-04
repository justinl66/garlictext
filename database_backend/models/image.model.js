module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('image', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }    },
    roundId: {
      type: DataTypes.STRING(6), // Use roomId instead of roundId - 6 digit lobby code
      allowNull: true, // Make optional since we're simplifying
      references: {
        model: 'games',
        key: 'id'
      }
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    originalDrawingData: {
      type: DataTypes.BLOB,
      allowNull: false
    },
    originalDrawingMimeType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'image/png'
    },
    enhancedImageData: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    enhancedImageMimeType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'image/png'
    },
    captionedImageData: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    captionedImageMimeType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'image/png'
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
