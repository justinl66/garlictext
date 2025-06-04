const { Pool } = require('pg');
const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: 'postgres',
    logging: false
  });
}

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    const client = await pool.connect();
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('UUID extension enabled');
    } catch (err) {
      console.error('Error enabling extensions:', err);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.pool = pool;

db.User = require('./user.model')(sequelize, Sequelize);
db.Game = require('./game.model')(sequelize, Sequelize);
db.Image = require('./image.model')(sequelize, Sequelize);
db.Caption = require('./caption.model')(sequelize, Sequelize);
db.Prompt = require('./prompt.model')(sequelize, Sequelize);
// Note: GameRound model removed as part of simplification
db.User.hasMany(db.Image, { as: 'images', foreignKey: 'userId' });
db.Image.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

db.User.hasMany(db.Caption, { as: 'captions', foreignKey: 'userId' });
db.Caption.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

// Note: GameRound associations removed as part of simplification

db.Game.belongsToMany(db.User, { through: 'GameParticipants', as: 'participants' });
db.User.belongsToMany(db.Game, { through: 'GameParticipants', as: 'games' });

db.Image.hasMany(db.Caption, { as: 'captions', foreignKey: 'imageId' });
db.Caption.belongsTo(db.Image, { as: 'image', foreignKey: 'imageId' });

// Note: Images and Captions now reference games directly via roundId field (which stores roomId)
db.Game.hasMany(db.Image, { as: 'images', foreignKey: 'roundId' });
db.Image.belongsTo(db.Game, { as: 'game', foreignKey: 'roundId' });

db.Game.hasMany(db.Caption, { as: 'captions', foreignKey: 'roundId' });
db.Caption.belongsTo(db.Game, { as: 'game', foreignKey: 'roundId' });

db.User.hasMany(db.Prompt, { as: 'createdPrompts', foreignKey: 'creatorId' });
db.Prompt.belongsTo(db.User, { as: 'creator', foreignKey: 'creatorId' });

db.User.hasMany(db.Prompt, { as: 'assignedPrompts', foreignKey: 'assignedToId' });
db.Prompt.belongsTo(db.User, { as: 'assignedTo', foreignKey: 'assignedToId' });

db.Game.hasMany(db.Prompt, { as: 'prompts', foreignKey: 'roundId' });
db.Prompt.belongsTo(db.Game, { as: 'game', foreignKey: 'roundId' });

db.Prompt.hasMany(db.Image, { as: 'images', foreignKey: 'promptId' });
db.Image.belongsTo(db.Prompt, { as: 'promptData', foreignKey: 'promptId' });

module.exports = db;
