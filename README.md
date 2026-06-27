# FeedSense Backend API

FastAPI-based sentiment analysis backend for the FeedSense application.

## Setup

### Local Development

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `ML_SERVICE_URL` - URL of the ML service (e.g., http://localhost:5001/predict)
- `CLIENT_URL` - Frontend URL for CORS

### Run Locally

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Feedback
- `POST /api/feedback` - Create feedback with sentiment analysis
- `POST /api/feedback/analyze-preview` - Analyze sentiment without saving
- `GET /api/feedback/my-feedback` - Get user's feedbacks
- `GET /api/feedback/all` - Get all feedbacks (admin only)
- `DELETE /api/feedback/:id` - Delete feedback

## Deployment

### Render

1. Push this repository to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set environment variables in Render dashboard
5. Deploy!

## Technologies

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Axios (for ML service calls)
