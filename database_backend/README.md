# GarlicText Database Backend

This is the PostgreSQL database backend for the GarlicText application.

## Table of Contents
- [Setup](#setup)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Development](#development)

## Setup

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (v15+ recommended)

### Installation

1. Install dependencies:
```bash
cd database_backend
npm install
```

2. Set up environment variables:
Copy the `.env.example` file to `.env` and update the values:
```bash
cp .env.example .env
```

3. Initialize the database:
```bash
npm run db:setup
```

This will create the database tables and seed some initial data.

### Running the server

```bash
npm start       # Production mode
npm run dev     # Development mode with auto-reload
```

## Database Schema

The database consists of the following main entities:

### Users
- Stores user information and authentication details
- Tracks user statistics (score, games played/won)

### Games
- Represents a game session
- Contains game settings, status, and references to participants

### Game Rounds
- Represents a round within a game
- Tracks the current phase (drawing, captioning, voting)

### Images
- Stores user-generated drawings and AI-enhanced versions
- Links to the user who created it and the game round

### Captions
- Stores user-submitted captions for images
- Links captions to users, images, and game rounds

## API Endpoints

### Users API

- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a user by ID
- `GET /api/users/firebase/:firebaseUid` - Get a user by Firebase UID
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Games API

- `POST /api/games` - Create a new game
- `POST /api/games/join` - Join an existing game
- `POST /api/games/:gameId/start` - Start a game
- `POST /api/games/:gameId/rounds/:roundNumber/end` - End a game round
- `GET /api/games` - Get all games
- `GET /api/games/code/:code` - Get a game by code
- `GET /api/games/:id` - Get a game by ID

### Images API

- `POST /api/images` - Create a new image
- `PUT /api/images/:id/enhance` - Update an image with AI-enhanced version
- `POST /api/images/:id/vote` - Add a vote to an image
- `GET /api/images/round/:roundId` - Get images for a round
- `GET /api/images/:id` - Get an image by ID

### Captions API

- `POST /api/captions` - Create a new caption
- `POST /api/captions/:id/vote` - Add a vote to a caption
- `GET /api/captions/image/:imageId` - Get captions for an image
- `GET /api/captions/round/:roundId` - Get captions for a round
- `GET /api/captions/:id` - Get a caption by ID

## Development

### Database Management

- `npm run db:setup` - Initialize database tables
- `npm run db:reset` - Reset and recreate all tables (CAUTION: Deletes all data)
- `npm run db:seed` - Add sample data to the database

### Docker Support

You can run the database backend using Docker:

```bash
# Build the Docker image
docker build -t garlictext-db-backend .

# Run the container
docker run -p 5001:5001 -e DATABASE_URL=postgresql://username:password@host:port/database garlictext-db-backend
```

Or use Docker Compose to run the entire application stack (recommended):

```bash
docker-compose up
```
