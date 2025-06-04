module.exports = (sequelize, DataTypes) => {
  const Caption = sequelize.define('caption', {
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
      }
    },
    imageId: {
      type: DataTypes.UUID,
      references: {
        model: 'images',
        key: 'id'
      }
    },    roundId: {
      type: DataTypes.STRING(6), // Use roomId instead of roundId - 6 digit lobby code
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: true
  });

  return Caption;
};
