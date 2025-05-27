module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    firebaseUid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    profilePictureUrl: {
      type: DataTypes.STRING
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    gamesPlayed: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    gamesWon: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: true
  });

  return User;
};
