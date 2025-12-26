# StitchCraft - Digital Tailoring Marketplace

A comprehensive MERN stack application connecting skilled tailors, customers, and suppliers across Pakistan.

## Project Structure

```
Stitch-Craft/
├── backend/           # Express.js backend server
│   ├── config/        # Configuration files (MongoDB connection)
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Custom middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── utils/         # Utility functions
│   ├── server.js      # Main server file
│   └── package.json   # Backend dependencies
│
└── frontend/          # React.js frontend application
    ├── public/        # Static files
    ├── src/           # React source files
    └── package.json   # Frontend dependencies
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
```

4. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Features (To be implemented)

- Tailor Service Marketplace
- Raw Material Marketplace
- Customer Experience Features
- Tailor Business Management
- AI-Powered Design Assistant
- Augmented Reality Fitting

## Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Styling**: CSS3 with custom design system

## Color Scheme

- Primary: #8b4513 (Saddle Brown)
- Secondary: #d4a574 (Tan)
- Background: #f5f1eb (Beige)
- Text: #2c1810 (Dark Brown)
- Accent: #5a4a3a (Medium Brown)

