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
db.GameRound = require('./gameRound.model')(sequelize, Sequelize);
db.User.hasMany(db.Image, { as: 'images', foreignKey: 'userId' });
db.Image.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

db.User.hasMany(db.Caption, { as: 'captions', foreignKey: 'userId' });
db.Caption.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

db.Game.hasMany(db.GameRound, { as: 'rounds', foreignKey: 'gameId' });
db.GameRound.belongsTo(db.Game, { as: 'game', foreignKey: 'gameId' });

db.Game.belongsToMany(db.User, { through: 'GameParticipants', as: 'participants' });
db.User.belongsToMany(db.Game, { through: 'GameParticipants', as: 'games' });

db.Image.hasMany(db.Caption, { as: 'captions', foreignKey: 'imageId' });
db.Caption.belongsTo(db.Image, { as: 'image', foreignKey: 'imageId' });

db.GameRound.hasMany(db.Image, { as: 'images', foreignKey: 'roundId' });
db.Image.belongsTo(db.GameRound, { as: 'round', foreignKey: 'roundId' });

db.GameRound.hasMany(db.Caption, { as: 'captions', foreignKey: 'roundId' });
db.Caption.belongsTo(db.GameRound, { as: 'round', foreignKey: 'roundId' });

module.exports = db;
