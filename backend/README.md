# StitchCraft Backend

Backend server for StitchCraft - Digital Tailoring Marketplace

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
```

3. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## Folder Structure

```
backend/
├── config/
│   └── db.js          # MongoDB connection configuration
├── controllers/       # Route controllers
├── middleware/        # Custom middleware
├── models/            # Mongoose models
├── routes/            # API routes
├── utils/             # Utility functions
├── server.js          # Main server file
└── package.json       # Dependencies
```

## API Endpoints

- `GET /` - Server health check

