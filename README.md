# GarlicText
### A multiplayer drawing and captioning game

## Project Overview
GarlicText is a fun multiplayer web game where players:
1. **Draw** images based on prompts
2. **Caption** other players' drawings  
3. **Vote** on the best captions to score points

The project consists of:
- **Frontend**: React with TypeScript and Tailwind CSS
- **Database Backend**: Node.js/Express server with PostgreSQL
- **Python Backend**: Currently unused - exists for future AI integration

## Prerequisites
Before setting up the project, ensure you have:
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or higher)

## Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/justinl66/garlictext.git
cd garlictext
```

### 2. Environment Configuration
Set up the required environment variables for the backend:

**Copy and configure the backend environment file:**
```cmd
cd database_backend
copy .env.example .env
```

Edit the `.env` file with your PostgreSQL configuration:
```bash
# Database Backend Environment Variables
NODE_ENV=development
PORT=5001

# PostgreSQL Configuration
PGHOST=localhost
PGUSER=postgres
PGDATABASE=garlictext
PGPASSWORD=your_postgres_password
PGPORT=5432
```

**Firebase Configuration:**
The application uses Firebase for authentication and requires both client-side and server-side credentials:

1. **Client-side (Frontend)**: Add Firebase config to `frontend/.env.development`:
   ```bash
   # Firebase Client Configuration
   VITE_API_KEY="AIzaSyDf_dA9Yc-lZpkdd46Uf6LIBeJH2xB9OLM"
   VITE_AUTH_DOMAIN="garlic-text.firebaseapp.com"
   VITE_PROJECT_ID="garlic-text"
   VITE_STORAGE_BUCKET="garlic-text.firebasestorage.app"
   VITE_MESSAGING_SENDER_ID="734733266033"
   VITE_APP_ID="1:734733266033:web:f26afa8be82faa09e6ffd0"
   VITE_MEASUREMENT_ID="G-0F1K50L53J"
   ```
**Note:** The frontend already has the correct environment files (`.env.development` and firebase-credentials.json) configured for local development.

### 3. Database Setup
First, install PostgreSQL if you haven't already, then set up the database:

**On Windows:**
```cmd
cd database_backend
npm install
setup_db.bat
```

**On macOS/Linux:**
```bash
cd database_backend
npm install
chmod +x setup_db.sh
./setup_db.sh
```

This script will:
- Create the `garlictext` database
- Set up all required tables
- Configure the database schema

### 4. Backend Setup
Install dependencies and start the database server:
```cmd
cd database_backend
npm install
npm run dev
```

The backend server will start on **http://localhost:5001**

### 5. Frontend Setup
In a new terminal window:
```cmd
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**

## Running the Application

1. **Open your browser** and navigate to **http://localhost:5173**

2. **Create or join a game** and start playing!
