# Garlic Text
### A stupid game for stupid people

## Project Overview
GarlicText is a multiplayer game where players draw images, enhance them with AI, and caption them. The project consists of:
- Frontend (React with TypeScript)
- Database Backend (Node.js with PostgreSQL)
- Python Backend (AI image enhancement)

## Setup for Development

### Frontend Setup:
```
cd frontend
npm install
npm run dev
```

### Database Backend Setup:
1. Install PostgreSQL if you haven't already
2. Set up the database:
```
cd database_backend
# On Windows:
setup_db.bat
# On Unix/Mac:
./setup_db.sh
```
3. Install dependencies and start the server:
```
npm install
npm run dev
```

### Python Backend Setup:
```
cd python_backend
pip install -r requirements.txt
python api_server.py
```

## Docker Setup (All Components)

To run the entire application using Docker:
```
docker-compose up --build
```

This will start all services:
- Frontend: Available at http://localhost:5173
- Database Backend: Available at http://localhost:5000
- Python Backend: Available at http://localhost:8000
- PostgreSQL Database: Available at localhost:5432

## Architecture

### Database Schema
The PostgreSQL database includes tables for:
- Users - Player information and authentication
- Games - Game sessions and settings
- Game Rounds - Individual rounds within a game
- Images - User-generated drawings and AI-enhanced versions
- Captions - User-submitted captions for images

### API Integration
The database backend exposes RESTful endpoints for the frontend to:
- Create and join games
- Save drawings and captions
- Handle voting and game progression
- Track user scores and statistics

For more detailed information about each component, see the README files in their respective directories.
