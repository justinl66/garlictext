require('dotenv').config();
const db = require('./models');
const { User, Game, Image, Caption, Prompt } = db;

const initDb = async () => {
  try {
    if (process.env.NODE_ENV === 'development' && process.argv.includes('--force')) {
      await db.sequelize.sync({ force: true });
    } else {
      await db.sequelize.sync({ alter: true });
    }
    if (process.env.NODE_ENV === 'development' || process.argv.includes('--seed')) {
      await seedData();
    }  } catch (error) {
  } finally {
    if (process.argv.includes('--exit')) {
      await db.sequelize.close();
      process.exit();
    }
  }
};

const seedData = async () => {
  try {
    const userCount = await User.count();
      if (userCount === 0) {
      const users = await User.bulkCreate([
        {
          id: 'udehwkufdbfed',
          username: 'johndoe',
          email: 'john@example.com',
          profilePictureUrl: 'https://via.placeholder.com/150',
          score: 120,
          gamesPlayed: 15,
          gamesWon: 3
        },
        {
          id: 'eidhiefdedwlde',
          username: 'janedoe',
          email: 'jane@example.com',
          profilePictureUrl: 'https://via.placeholder.com/150',
          score: 95,
          gamesPlayed: 12,
          gamesWon: 2
        },
        {
          id: 'edhuedhuef',
          username: 'testuser',
          email: 'test@example.com',
          profilePictureUrl: 'https://via.placeholder.com/150',
          score: 50,
          gamesPlayed: 5,
          gamesWon: 1
        }      ]);
      
      const game = await Game.create({
        id: 'ABC123',
        name: 'Sample Game',
        status: 'waiting',
        hostId: users[0].id,
        maxPlayers: 8,
        totalRounds: 3
      });
        await game.addParticipants([users[0].id, users[1].id]);
      
      const activeGame = await Game.create({
        id: 'DEF456',
        name: 'Active Game',
        status: 'in_progress',
        hostId: users[2].id,
        maxPlayers: 8,
        currentRound: 1,
        totalRounds: 3
      });
        await activeGame.addParticipants([users[0].id, users[1].id, users[2].id]);
      
      const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const sampleImageBuffer = Buffer.from(samplePngBase64, 'base64');
      
      const sampleImage1 = await Image.create({
        userId: users[0].id,
        roundId: activeGame.id,
        prompt: 'A funny cat wearing sunglasses',
        originalDrawingData: sampleImageBuffer,
        originalDrawingMimeType: 'image/png',
        enhancedImageData: sampleImageBuffer,
        enhancedImageMimeType: 'image/png'
      });
      
      const sampleImage2 = await Image.create({
        userId: users[1].id,
        roundId: activeGame.id,
        prompt: 'A dog riding a skateboard',
        originalDrawingData: sampleImageBuffer,
        originalDrawingMimeType: 'image/png',
        enhancedImageData: sampleImageBuffer,
        enhancedImageMimeType: 'image/png'
      });
      
      // Create captions for the images
      await Caption.create({
        userId: users[1].id,
        imageId: sampleImage1.id,
        roundId: activeGame.id,
        text: 'The coolest cat in town!'
      });
      
      await Caption.create({
        userId: users[2].id,
        imageId: sampleImage1.id,
        roundId: activeGame.id,
        text: 'Ready for the summer vibes'
      });
      
      await Caption.create({
        userId: users[0].id,
        imageId: sampleImage2.id,
        roundId: activeGame.id,
        text: 'Skater boy doing tricks'
      });
      }
  } catch (error) {
  }
};

initDb();
