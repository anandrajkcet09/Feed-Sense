# FeedSense Server (Backend)

## Setup Instructions

1. **Install dependencies:**
   
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables:**
   
   - Copy `.env.example` to `.env` and update values as needed.

3. **Start the server:**
   
   ```bash
   npm start
   ```

4. **Seed admin user (optional):**
   
   ```bash
   node seedAdmin.js
   ```

5. **API runs on:**
   
   - Default: `http://localhost:5000` (check `.env` for port).
