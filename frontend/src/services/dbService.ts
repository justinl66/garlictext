// Database Service client for frontend

import axios from 'axios';

// Base URL from environment variable or default to localhost in development
const API_BASE_URL = import.meta.env.VITE_DB_API_URL || 'http://localhost:5001/api';

// Create an axios instance for the database API
const dbApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// User-related API calls
const userApi = {
  // Create a new user
  createUser: async (userData) => {
    try {
      const response = await dbApi.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Get a user by Firebase UID
  getUserByFirebaseUid: async (firebaseUid) => {
    try {
      const response = await dbApi.get(`/users/firebase/${firebaseUid}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user by Firebase UID:', error);
      throw error;
    }
  },
  
  // Update a user
  updateUser: async (userId, userData) => {
    try {
      const response = await dbApi.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

// Game-related API calls
const gameApi = {
  // Create a new game
  createGame: async (gameData) => {
    try {
      const response = await dbApi.post('/games', gameData);
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },
  
  // Join a game
  joinGame: async (userId, gameCode) => {
    try {
      const response = await dbApi.post('/games/join', { userId, gameCode });
      return response.data;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  },
  
  // Start a game
  startGame: async (gameId, hostId) => {
    try {
      const response = await dbApi.post(`/games/${gameId}/start`, { hostId });
      return response.data;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  },
  
  // End a game round
  endGameRound: async (gameId, roundNumber) => {
    try {
      const response = await dbApi.post(`/games/${gameId}/rounds/${roundNumber}/end`, {});
      return response.data;
    } catch (error) {
      console.error('Error ending game round:', error);
      throw error;
    }
  },
  
  // Get a game by code
  getGameByCode: async (gameCode) => {
    try {
      const response = await dbApi.get(`/games/code/${gameCode}`);
      return response.data;
    } catch (error) {
      console.error('Error getting game by code:', error);
      throw error;
    }
  },
  
  // Get a game by ID
  getGameById: async (gameId) => {
    try {
      const response = await dbApi.get(`/games/${gameId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting game by ID:', error);
      throw error;
    }
  }
};

// Image-related API calls
const imageApi = {
  // Create a new image
  createImage: async (imageData) => {
    try {
      const response = await dbApi.post('/images', imageData);
      return response.data;
    } catch (error) {
      console.error('Error creating image:', error);
      throw error;
    }
  },
  
  // Update an image with enhanced version
  updateEnhancedImage: async (imageId, enhancedImageUrl) => {
    try {
      const response = await dbApi.put(`/images/${imageId}/enhance`, { enhancedImageUrl });
      return response.data;
    } catch (error) {
      console.error('Error updating enhanced image:', error);
      throw error;
    }
  },
  
  // Add a vote to an image
  voteForImage: async (imageId) => {
    try {
      const response = await dbApi.post(`/images/${imageId}/vote`);
      return response.data;
    } catch (error) {
      console.error('Error voting for image:', error);
      throw error;
    }
  },
  
  // Get images for a round
  getImagesByRound: async (roundId) => {
    try {
      const response = await dbApi.get(`/images/round/${roundId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting images by round:', error);
      throw error;
    }
  }
};

// Caption-related API calls
const captionApi = {
  // Create a new caption
  createCaption: async (captionData) => {
    try {
      const response = await dbApi.post('/captions', captionData);
      return response.data;
    } catch (error) {
      console.error('Error creating caption:', error);
      throw error;
    }
  },
  
  // Add a vote to a caption
  voteForCaption: async (captionId) => {
    try {
      const response = await dbApi.post(`/captions/${captionId}/vote`);
      return response.data;
    } catch (error) {
      console.error('Error voting for caption:', error);
      throw error;
    }
  },
  
  // Get captions for an image
  getCaptionsByImage: async (imageId) => {
    try {
      const response = await dbApi.get(`/captions/image/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting captions by image:', error);
      throw error;
    }
  },
  
  // Get captions for a round
  getCaptionsByRound: async (roundId) => {
    try {
      const response = await dbApi.get(`/captions/round/${roundId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting captions by round:', error);
      throw error;
    }
  }
};

// Export the API client
const dbService = {
  user: userApi,
  game: gameApi,
  image: imageApi,
  caption: captionApi
};

export default dbService;
