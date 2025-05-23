require('dotenv').config();
const axios = require('axios');

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;
const testApi = async () => {
  try {
    console.log('Testing Database API Endpoints...');
    console.log('==============================');
    console.log('API URL:', API_URL);
    console.log('==============================\n');
    
    console.log('Testing root endpoint:');
    const rootResponse = await axios.get(`http://localhost:${process.env.PORT || 5000}`);
    console.log('✅ Root endpoint response:', rootResponse.data);
    console.log('------------------------------\n');
    
    console.log('Testing user creation:');
    const userData = {
      username: `test_user_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      firebaseUid: `firebase_${Date.now()}`,
      profilePictureUrl: 'https://via.placeholder.com/150'
    };
    
    const userResponse = await axios.post(`${API_URL}/users`, userData);
    console.log('✅ User created:', userResponse.data);    const userId = userResponse.data.id;
    console.log('------------------------------\n');
    
    console.log('Testing game creation:');
    const gameData = {
      name: `Test Game ${Date.now()}`,
      hostId: userId,
      maxPlayers: 8,
      totalRounds: 3
    };
    
    const gameResponse = await axios.post(`${API_URL}/games`, gameData);
    console.log('✅ Game created:', gameResponse.data);
    const gameId = gameResponse.data.id;
    console.log('------------------------------\n');
    
    console.log('Testing game retrieval:');
    const gameGetResponse = await axios.get(`${API_URL}/games/${gameId}`);    console.log('✅ Game retrieved:', gameGetResponse.data);
    console.log('------------------------------\n');
    
    console.log('Testing game start:');
    const gameStartResponse = await axios.post(`${API_URL}/games/${gameId}/start`, { hostId: userId });
    console.log('✅ Game started:', gameStartResponse.data);
    console.log('------------------------------\n');
    
    console.log('Testing image creation:');
    const roundId = gameStartResponse.data.currentRound;
    const imageData = {
      userId,
      roundId,
      prompt: 'Test drawing prompt',
      originalDrawingUrl: 'https://via.placeholder.com/400x300'
    };
    
    const imageResponse = await axios.post(`${API_URL}/images`, imageData);
    console.log('✅ Image created:', imageResponse.data);    const imageId = imageResponse.data.id;
    console.log('------------------------------\n');
    
    console.log('Testing caption creation:');
    const captionData = {
      userId,
      imageId,
      roundId,
      text: 'This is a test caption for the image'
    };
    
    const captionResponse = await axios.post(`${API_URL}/captions`, captionData);
    console.log('✅ Caption created:', captionResponse.data);
    console.log('------------------------------\n');
    
    console.log('All tests completed successfully! 🎉');
    
  } catch (error) {
    console.error('Error during API testing:', error.response?.data || error.message);
    process.exit(1);
  }
};

testApi();
