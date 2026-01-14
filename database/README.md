# MS Manager - Backend Server

Backend server for MS Manager racing game with MongoDB database and JWT authentication.

## Features

- ✅ User registration and login with secure password hashing (bcrypt)
- ✅ JWT token-based authentication
- ✅ RESTful API for game data management
- ✅ MongoDB database with Mongoose ODM
- ✅ CORS enabled for frontend communication
- ✅ Input validation and error handling
- ✅ Secure password storage

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/msmanager
     JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
     JWT_EXPIRE=7d
     CLIENT_URL=http://127.0.0.1:5500
     ```

3. **Install MongoDB:**
   - **Option A - Local MongoDB:**
     - Download from https://www.mongodb.com/try/download/community
     - Install and start MongoDB service
   
   - **Option B - MongoDB Atlas (Cloud):**
     - Create free account at https://www.mongodb.com/cloud/atlas
     - Create a cluster and get connection string
     - Update `MONGODB_URI` in `.env`

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

**Register new user:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "password": "password123",
  "teamName": "Team Rocket"
}
```

**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "password123"
}
```

### User Data (Protected - requires JWT token)

**Get user profile:**
```http
GET /api/user/profile
Authorization: Bearer <your_jwt_token>
```

**Update game data:**
```http
PUT /api/user/gamedata
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "budget": 15000000,
  "drivers": [...],
  "managers": [...],
  "upgrades": {...},
  "careerMode": {...},
  "raceHistory": [...]
}
```

**Delete account:**
```http
DELETE /api/user/account
Authorization: Bearer <your_jwt_token>
```

### Health Check

```http
GET /api/health
```

## Project Structure

```
server/
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   └── User.js            # User schema
├── routes/
│   ├── auth.js            # Authentication routes
│   └── user.js            # User data routes
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
└── server.js              # Main server file
```

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens for stateless authentication
- Input validation with express-validator
- Protected routes with middleware
- CORS configured for specific origin
- Environment variables for sensitive data

## Next Steps

To connect the frontend to this backend:

1. Update the frontend auth files to make API calls instead of using localStorage
2. Store JWT token in localStorage after login
3. Send token in Authorization header for protected requests
4. Handle token expiration and refresh

## Troubleshooting

**MongoDB connection error:**
- Ensure MongoDB is running locally or check Atlas connection string
- Verify `MONGODB_URI` in `.env` file

**Port already in use:**
- Change `PORT` in `.env` file to a different port

**CORS errors:**
- Update `CLIENT_URL` in `.env` to match your frontend URL
