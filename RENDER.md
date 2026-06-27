Render deployment steps
----------------------

Quick steps to deploy this repo to Render:

1. Connect your GitHub repo (https://github.com/anandrajkcet09/Feed-Sense) to Render.
2. Create a new "Web Service" using the `render.yaml` manifest (select the `main` branch).
3. In Render dashboard, add the following environment variables for the service:
   - `MONGO_URI` : your MongoDB connection string
   - `JWT_SECRET` : JWT signing secret
   - `CLIENT_URL` : optional, comma-separated allowed origins for CORS
   - `PORT` : optional (Render sets this automatically)

Notes
- The manifest runs the client build (`client/dist`) then installs server dependencies and starts the server (`server/index.js`).
- The Express server is already configured to serve the built client from `client/dist`.
- Set `RUN_LOCAL=true` in your local `.env` if you want to force local behavior.

If you prefer manual setup instead of render.yaml:

- Create a Web Service (Node) with these commands:

  Build command:

  ```bash
  cd client && npm ci && npm run build
  cd ../server && npm ci
  ```

  Start command:

  ```bash
  cd server && npm start
  ```

Finally, set the environment variables listed above in the Render dashboard and deploy.

ML service (optional)
- The repository includes a small FastAPI `ml-service` at `ml-service/main.py`.
- To run it on Render as a separate service, add a second Web Service with these commands:

  Build command:

  ```bash
  cd ml-service && pip install -r requirements.txt
  ```

  Start command:

  ```bash
  cd ml-service && uvicorn main:app --host 0.0.0.0 --port 5001
  ```

If both services are deployed on Render, update the Node server `CLIENT_URL` / frontend API base URL to point to the appropriate Render service URLs.
