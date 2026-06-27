# FeedSense Frontend

React + Vite frontend for the FeedSense sentiment analysis application.

## Setup

### Local Development

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required variables:
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000)

### Run Locally

```bash
npm run dev
```

App runs on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output: `dist/` directory

## Deployment

### Render

1. Push this repository to GitHub
2. Create a new Static Site on Render
3. Connect your GitHub repository
4. Set `VITE_API_URL` to your backend URL (e.g., `https://feedsense-backend.onrender.com`)
5. Deploy!

## Technologies

- React 19
- Vite (fast build tool)
- React Router (navigation)
- Tailwind CSS (styling)
- Axios (HTTP requests)
- React Hot Toast (notifications)
- Recharts (data visualization)
