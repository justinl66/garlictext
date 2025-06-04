import axios from 'axios';
import { auth } from '../firebase/firebaseConfig';

const getCurrentUserToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    return await currentUser.getIdToken(true);
  } catch (error) {
    return null;
  }
};

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

const API_BASE_URL = import.meta.env.VITE_DB_API_URL || 'http://localhost:5001/api';

const dbApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

dbApi.interceptors.request.use(
  async (config) => {
    const token = await getCurrentUserToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
    try {
      const response = await dbApi.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

const gameApi = {
  // Create a new game
  createGame: async (gameData: GameData) => {
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

const imageApi = {
  createImage: async (imageData: {
    roundId?: string;
    prompt: string;
    originalDrawingData: string;
    enhancedImageData?: string;
    enhancedImageMimeType?: string;
  }) => {
    try {
      const response = await dbApi.post('/images', imageData);
      return response.data;
    } catch (error) {
      console.error('Error creating image:', error);
      throw error;
    }  
  },
  
  updateEnhancedImage: async (imageId: string, enhancedImageData: string, enhancedImageMimeType?: string) => {
    try {
      const response = await dbApi.put(`/images/${imageId}/enhance`, { 
        enhancedImageData,
        enhancedImageMimeType: enhancedImageMimeType || 'image/png'
      });
      return response.data;
    } catch (error) {
      console.error('Error updating enhanced image:', error);
      throw error;
    }  
  },
  
  getOriginalImageUrl: (imageId: string) => {
    return `${API_BASE_URL}/images/${imageId}/original`;  },
  
  getEnhancedImageUrl: (imageId: string) => {
    return `${API_BASE_URL}/images/${imageId}/enhanced`;  },
  voteForImage: async (imageId: string, rating: number = 1) => {
    try {
      const response = await dbApi.post(`/images/${imageId}/vote`, { rating });
      return response.data;
    } catch (error) {
      throw error;
    }  
  },
    getImagesByRound: async (roundId: string) => {
    try {
      const response = await dbApi.get(`/images/round/${roundId}`);
      return response.data;
    } catch (error) {
      throw error;
    }  
  },
  getLatestImage: async () => {
    try {
      const response = await dbApi.get(`/images/latest`);
      return response.data;
    } catch (error) {
      throw error;
    }  
  },  getAssignedImageForUser: async (gameId: string) => {
    try {
      const response = await dbApi.get(`/images/assigned/${gameId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getImageById: async (imageId: string) => {
    try {
      const response = await dbApi.get(`/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateCaptionedImage: async (imageId: string, captionedImageData: string, captionedImageMimeType?: string) => {
    try {
      const response = await dbApi.put(`/images/${imageId}/caption`, { 
        captionedImageData,
        captionedImageMimeType: captionedImageMimeType || 'image/png'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCaptionedImageUrl: (imageId: string) => {
    return `${API_BASE_URL}/images/${imageId}/captioned`;
  }
};

const captionApi = {  createCaption: async (captionData: {
    imageId: string;
    roundId: string;
    text: string;
  }) => {
    try {
      const response = await dbApi.post('/captions', captionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  voteForCaption: async (captionId: string, rating: number = 1) => {
    try {
      const response = await dbApi.post(`/captions/${captionId}/vote`, { rating });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
    getCaptionsByImage: async (imageId: string) => {
    try {
      const response = await dbApi.get(`/captions/image/${imageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getCaptionsByRound: async (roundId: string) => {
    try {
      const response = await dbApi.get(`/captions/round/${roundId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

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

interface GameLeaderboardItem {
  userId: number;
  username: string;
  profilePictureUrl?: string;
  
  totalVotes: number;
  votePercentage: number;

  bestSubmission: BestSubmission | null;
  bestVotes: number;

  medal: 'gold' | 'silver' | 'bronze' | null;
  rank: number;
}

interface GameResults {
  gameId: number;
  gameCode: string;
  title: string;
  totalVotes: number;
  topDrawings: DrawingWithVotes[];
  leaderboard: GameLeaderboardItem[];
}

const resultsApi = {
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

const dbService = {
  user: userApi,
  game: gameApi,
  image: imageApi,
  caption: captionApi,
  results: resultsApi
};

export default dbService;
