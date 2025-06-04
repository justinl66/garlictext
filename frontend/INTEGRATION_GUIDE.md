# Frontend-Database Integration Guide

This guide outlines how to connect the React frontend with the PostgreSQL database backend.

## Database Service

The `dbService.ts` file provides a comprehensive client for making database API calls. Here's how to use it in your components:

## Basic Usage

```typescript
import dbService from '../../services/dbService';

// Example component using the database service
const MyComponent = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Example: Get a game by code
        const game = await dbService.game.getGameByCode('ABC123');
        setData(game);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);
  
  // Component rendering...
}
```

## Available Services

The database service is organized into modules for different types of data:

### User Service

- `dbService.user.createUser(userData)` - Create a new user
- `dbService.user.getUserByFirebaseUid(firebaseUid)` - Get a user by Firebase UID
- `dbService.user.updateUser(userId, userData)` - Update a user

### Game Service

- `dbService.game.createGame(gameData)` - Create a new game
- `dbService.game.joinGame(userId, gameCode)` - Join a game
- `dbService.game.startGame(gameId, hostId)` - Start a game
- `dbService.game.endGameRound(gameId, roundNumber)` - End a game round
- `dbService.game.getGameByCode(gameCode)` - Get a game by code
- `dbService.game.getGameById(gameId)` - Get a game by ID

### Image Service

- `dbService.image.createImage(imageData)` - Create a new image
- `dbService.image.updateEnhancedImage(imageId, enhancedImageUrl)` - Update an image with AI-enhanced version
- `dbService.image.voteForImage(imageId)` - Add a vote to an image
- `dbService.image.getImagesByRound(roundId)` - Get images for a round

### Caption Service

- `dbService.caption.createCaption(captionData)` - Create a new caption
- `dbService.caption.voteForCaption(captionId)` - Add a vote to a caption
- `dbService.caption.getCaptionsByImage(imageId)` - Get captions for an image
- `dbService.caption.getCaptionsByRound(roundId)` - Get captions for a round

## Example Integration Flow

Here's a typical flow for a game:

1. **User Authentication**: 
   - User signs in with Firebase Auth
   - Create/retrieve user record in the database using `dbService.user.getUserByFirebaseUid`

2. **Game Creation/Joining**:
   - Host creates a game with `dbService.game.createGame`
   - Players join with `dbService.game.joinGame`

3. **Game Rounds**:
   - Drawing phase: Save drawings with `dbService.image.createImage`
   - Caption phase: Submit captions with `dbService.caption.createCaption`
   - Voting phase: Submit votes with `dbService.caption.voteForCaption` or `dbService.image.voteForImage`

4. **Game Progression**:
   - End rounds with `dbService.game.endGameRound`
   - Update user scores with `dbService.user.updateUser`

## Error Handling

Always wrap database calls in try/catch blocks:

```typescript
try {
  const result = await dbService.game.getGameByCode(gameCode);
  // Process result
} catch (error) {
  console.error('Error fetching game:', error);
  // Handle error (show message, retry, etc.)
}
```
