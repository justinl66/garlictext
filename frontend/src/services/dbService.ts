// Database Service client for frontend

import axios from 'axios';

// Define TypeScript interfaces for data structures
interface UserData {
  id?: number;
  username?: string;
  email?: string;
  firebaseUid?: string;
  profilePictureUrl?: string;
  [key: string]: any; // For any additional properties
}

interface GameData {
  id?: number;
  gameCode?: string;
  hostId?: number;
  title?: string;
  status?: string;
  maxRounds?: number;
  [key: string]: any; // For any additional properties
}

interface ImageData {
  id?: number;
  roundId?: number;
  creatorId?: number;
  promptId?: number;
  imageUrl?: string;
  enhancedImageUrl?: string;
  [key: string]: any; // For any additional properties
}

interface CaptionData {
  id?: number;
  imageId?: number;
  creatorId?: number;
  text?: string;
  [key: string]: any; // For any additional properties
}

// Only using these interfaces with the API methods

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
  createUser: async (userData: UserData) => {
    try {
      const response = await dbApi.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Get a user by Firebase UID
  getUserByFirebaseUid: async (firebaseUid: string) => {
    try {
      const response = await dbApi.get(`/users/firebase/${firebaseUid}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user by Firebase UID:', error);
      throw error;
    }
  },
  
  // Update a user
  updateUser: async (userId: number, userData: UserData) => {
  updateUser: async (userId: string, userData: any) => {
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
  createGame: async (gameData: GameData) => {
  createGame: async (gameData: any) => {
    try {
      const response = await dbApi.post('/games', gameData);
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },
  
  // Join a game
  joinGame: async (userId: number, gameCode: string) => {
  joinGame: async (userId: string, gameCode) => {
    try {
      const response = await dbApi.post('/games/join', { userId, gameCode });
      return response.data;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  },
  
  // Start a game
  startGame: async (gameId: number, hostId: number) => {
    try {
      const response = await dbApi.post(`/games/${gameId}/start`, { hostId });
      return response.data;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  },
  
  // End a game round
  endGameRound: async (gameId: number, roundNumber: number) => {
    try {
      const response = await dbApi.post(`/games/${gameId}/rounds/${roundNumber}/end`, {});
      return response.data;
    } catch (error) {
      console.error('Error ending game round:', error);
      throw error;
    }
  },
  
  // Get a game by code
  getGameByCode: async (gameCode: string) => {
    try {
      const response = await dbApi.get(`/games/code/${gameCode}`);
      return response.data;
    } catch (error) {
      console.error('Error getting game by code:', error);
      throw error;
    }
  },
  
  // Get a game by ID
  getGameById: async (gameId: number) => {
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
  createImage: async (imageData: ImageData) => {
    try {
      const response = await dbApi.post('/images', imageData);
      return response.data;
    } catch (error) {
      console.error('Error creating image:', error);
      throw error;
    }
  },
  
  // Update an image with enhanced version
  updateEnhancedImage: async (imageId: number, enhancedImageUrl: string) => {
    try {
      const response = await dbApi.put(`/images/${imageId}/enhance`, { enhancedImageUrl });
      return response.data;
    } catch (error) {
      console.error('Error updating enhanced image:', error);
      throw error;
    }
  },
  
  // Add a vote to an image
  voteForImage: async (imageId: number) => {
    try {
      const response = await dbApi.post(`/images/${imageId}/vote`);
      return response.data;
    } catch (error) {
      console.error('Error voting for image:', error);
      throw error;
    }
  },
  
  // Get images for a round
  getImagesByRound: async (roundId: number) => {
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
  createCaption: async (captionData: CaptionData) => {
    try {
      const response = await dbApi.post('/captions', captionData);
      return response.data;
    } catch (error) {
      console.error('Error creating caption:', error);
      throw error;
    }
  },
  
  // Add a vote to a caption
  voteForCaption: async (captionId: number) => {
    try {
      const response = await dbApi.post(`/captions/${captionId}/vote`);
      return response.data;
    } catch (error) {
      console.error('Error voting for caption:', error);
      throw error;
    }
  },
  
  // Get captions for an image
  getCaptionsByImage: async (imageId: number) => {
    try {
      const response = await dbApi.get(`/captions/image/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting captions by image:', error);
      throw error;
    }
  },
  
  // Get captions for a round
  getCaptionsByRound: async (roundId: number) => {
    try {
      const response = await dbApi.get(`/captions/round/${roundId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting captions by round:', error);
      throw error;
    }
  }
};

// Define interfaces for results data types

// Drawing with its assigned caption and votes
interface DrawingWithVotes {
  drawingId: number;
  imageUrl: string;
  enhancedImageUrl: string;
  votes: number;
  caption: {
    id: number;
    text: string;
    creator: {
      id: number;
      username: string;
    };
  };
  creator: {
    id: number;
    username: string;
  };
}

// Player's best submission in the game
interface BestSubmission {
  type: 'drawing';
  imageId: number;
  imageUrl: string;
  enhancedImageUrl: string;
  votes: number;
  captionId: number;
  captionText: string;
  captionCreator: {
    id: number;
    username: string;
  };
}

// Player in the game leaderboard
interface GameLeaderboardItem {
  userId: number;
  username: string;
  profilePictureUrl?: string;
  // Vote metrics
  totalVotes: number;       // Votes for their drawings 
  votePercentage: number;   // % of total game votes
  // Best content
  bestSubmission: BestSubmission | null;
  bestVotes: number;        // Votes on best submission
  // Rankings
  medal: 'gold' | 'silver' | 'bronze' | null;
  rank: number;
}

// Overall game results
interface GameResults {
  gameId: number;
  gameCode: string;
  title: string;
  totalVotes: number;
  topDrawings: DrawingWithVotes[];
  leaderboard: GameLeaderboardItem[];
}

// Results-related API calls
const resultsApi = {
  // Get aggregate results for an entire game
  getGameResults: async (gameId: number): Promise<GameResults> => {
    try {
      const response = await dbApi.get(`/results/games/${gameId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting game results:', error);
      throw error;
    }
  }
};

// Export combined API service
const dbService = {
  user: userApi,
  game: gameApi,
  image: imageApi,
  caption: captionApi,
  results: resultsApi
};

export default dbService;
