# FeedSense ML Service

Python FastAPI-based machine learning service for sentiment analysis using VADER.

## Setup

### Local Development

#### Create Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Optional variables:
- `PORT` - Service port (default: 5001)
- `ALLOWED_ORIGINS` - CORS allowed origins (default: *)

### Run Locally

```bash
python main.py
```

Service runs on `http://localhost:5001`

## API Endpoints

### Health Check
```
GET /health
```

Returns service status.

### Sentiment Analysis
```
POST /predict
Content-Type: application/json

{
  "text": "I love this product! It's amazing."
}
```

**Response:**
```json
{
  "sentiment": "Positive",
  "confidenceScore": 95,
  "detectedKeywords": ["love", "amazing"],
  "debug_vader_scores": {
    "neg": 0.0,
    "neu": 0.33,
    "pos": 0.67,
    "compound": 0.9
  }
}
```

## Deployment

### Render

1. Push this repository to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Runtime: Python 3.11
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `uvicorn main:app --host 0.0.0.0 --port 10001`
7. Deploy!

## Technologies

- FastAPI (modern web framework)
- Uvicorn (ASGI server)
- VADER Sentiment (lexicon-based sentiment analysis)
- Pydantic (data validation)

## How It Works

The service uses VADER (Valence Aware Dictionary and sEntiment Reasoner) to analyze sentiment:

- **Positive**: compound score ≥ 0.05
- **Negative**: compound score ≤ -0.05
- **Neutral**: compound score between -0.05 and 0.05

Confidence is calculated as:
- For positive/negative: |compound score| × 100
- For neutral: neutral probability × 100
