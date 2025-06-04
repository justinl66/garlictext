require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to GarlicText Database Backend' });
});


// Initialize Firebase Admin SDK
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

console.log("🔗 All routes configured");

db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 GarlicText Database Backend running on port ${PORT}`);
      console.log(`📸 Image API endpoints ready at http://localhost:${PORT}/api/images`);
      console.log(`📝 Caption API endpoints ready at http://localhost:${PORT}/api/captions`);
      console.log(`🔐 Authentication required for protected endpoints`);
    });
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });
