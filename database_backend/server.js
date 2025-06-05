require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./models');
const { cleanupTemporaryUsers } = require('./jobs/cleanup');
const cronConfig = require('./config/cronConfig');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to GarlicText Database Backend' });
});


const admin = require('firebase-admin');
const serviceAccount = require('./cute_dog_pics/garlic-text-firebase-adminsdk-fbsvc-3e3dabe43a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

require('./routes/game.routes')(app);
require('./routes/user.routes')(app);
require('./routes/image.routes')(app);
require('./routes/caption.routes')(app);
require('./routes/prompt.routes')(app);
require('./routes/results.routes')(app);
require('./routes/admin.routes')(app);

if (cronConfig.enableTempUserCleanup) {
  cron.schedule(cronConfig.cleanupSchedule, async () => {
    console.log('Running scheduled cleanup job for temporary users');
    await cleanupTemporaryUsers();
  });
  console.log(`Temporary user cleanup scheduled: ${cronConfig.cleanupSchedule}`);
}

db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      if (cronConfig.enableTempUserCleanup) {
        console.log(`Temporary user cleanup enabled. Will clean up users older than ${cronConfig.tempUserTtlHours} hours`);      } else {
        console.log('Temporary user cleanup is disabled');
      }
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
  });
