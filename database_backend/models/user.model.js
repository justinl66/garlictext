module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    profilePictureUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
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
