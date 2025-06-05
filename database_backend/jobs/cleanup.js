const db = require('../models');
const User = db.User;
const { Op } = db.Sequelize;

const config = require('../config/cronConfig');

const findTemporaryUsers = async (hoursAgo = null) => {
  if (hoursAgo === null) {
    hoursAgo = config.tempUserTtlHours || 2;
  }
  
  const cutoffTime = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000));
  
  return await User.findAll({
    where: {
      email: {
        [Op.like]: '%@gartictext.com'
      },
      createdAt: {
        [Op.lt]: cutoffTime
      }
    }
  });
};

const cleanupTemporaryUsers = async () => {
  try {
    const hoursAgo = config.tempUserTtlHours || 2;
    const cutoffTime = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000));
    
    console.log(`[${new Date().toISOString()}] Running temporary user cleanup job`);
    console.log(`Deleting temporary users created before: ${cutoffTime.toISOString()}`);

    const deletedUsers = await User.destroy({
      where: {
        email: {
          [Op.like]: '%@gartictext.com'
        },
        createdAt: {
          [Op.lt]: cutoffTime
        }
      }
    });

    console.log(`[${new Date().toISOString()}] Successfully deleted ${deletedUsers} temporary users`);
    return deletedUsers;} catch (error) {
    console.error(`[${new Date().toISOString()}] Error cleaning up temporary users:`, error);
  }
};

module.exports = {
  cleanupTemporaryUsers,
  findTemporaryUsers
};
