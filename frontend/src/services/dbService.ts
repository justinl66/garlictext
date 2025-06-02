import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_DB_API_URL || 'http://localhost:5001/api';

const dbApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const userApi = {
  getUserByFirebaseUid: async (firebaseUid: string) => {
    try {
      const response = await dbApi.get(`/users/firebase/${firebaseUid}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user by Firebase UID:', error);
      throw error;
    }  
  },
  
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

const gameApi = {
  createGame: async (gameData: any) => {
    try {
      const response = await dbApi.post('/games', gameData);
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }  
  },
  
  joinGame: async (userId: string, gameCode: string) => {
    try {
      const response = await dbApi.post('/games/join', { userId, gameCode });
      return response.data;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }  
  },
  
  startGame: async (gameId: string, hostId: string) => {
    try {
      const response = await dbApi.post(`/games/${gameId}/start`, { hostId });
      return response.data;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }  
  },
  
  endGameRound: async (gameId: string, roundNumber: number) => {
    try {
      const response = await dbApi.post(`/games/${gameId}/rounds/${roundNumber}/end`, {});
      return response.data;
    } catch (error) {
      console.error('Error ending game round:', error);
      throw error;
    }  
  },
  
  getGameByCode: async (gameCode: string) => {
    try {
      const response = await dbApi.get(`/games/code/${gameCode}`);
      return response.data;
    } catch (error) {
      console.error('Error getting game by code:', error);
      throw error;
    }  
  },
  getGameById: async (gameId: string) => {
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
    userId: string;
    roundId: string;
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
  
  voteForImage: async (imageId: string) => {
    try {
      const response = await dbApi.post(`/images/${imageId}/vote`);
      return response.data;
    } catch (error) {
      console.error('Error voting for image:', error);
      throw error;
    }  
  },
  
  getImagesByRound: async (roundId: string) => {
    try {
      const response = await dbApi.get(`/images/round/${roundId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting images by round:', error);
      throw error;
    }  
  },
  
  getImageById: async (imageId: string) => {
    try {
      const response = await dbApi.get(`/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting image by ID:', error);
      throw error;
    }
  }
};

const captionApi = {
  createCaption: async (captionData: {
    userId: string;
    imageId: string;
    roundId: string;
    text: string;
  }) => {
    try {
      const response = await dbApi.post('/captions', captionData);
      return response.data;
    } catch (error) {
      console.error('Error creating caption:', error);
      throw error;
    }
  },
  
  voteForCaption: async (captionId: string) => {
    try {
      const response = await dbApi.post(`/captions/${captionId}/vote`);
      return response.data;
    } catch (error) {
      console.error('Error voting for caption:', error);
      throw error;
    }
  },
  
  getCaptionsByImage: async (imageId: string) => {
    try {
      const response = await dbApi.get(`/captions/image/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting captions by image:', error);
      throw error;
    }
  },
  
  getCaptionsByRound: async (roundId: string) => {
    try {
      const response = await dbApi.get(`/captions/round/${roundId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting captions by round:', error);
      throw error;
    }
  }
};

const dbService = {
  user: userApi,
  game: gameApi,
  image: imageApi,
  caption: captionApi
};

export default dbService;
