from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="FeedSense ML Service",
    version="1.0.0",
    description="Sentiment Analysis Service using VADER"
)

# CORS Configuration
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
if allowed_origins[0] == '*':
    allowed_origins = ['*']

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the VADER analyzer
try:
    analyzer = SentimentIntensityAnalyzer()
    print("✅ VADER Analyzer initialized successfully!")
except Exception as e:
    print(f"❌ Failed to initialize VADER: {e}")
    raise

# Define the request payload
class TextRequest(BaseModel):
    text: str

def get_vader_keywords(text: str):
    """
    Extracts words that strongly influence the VADER score.
    """
    words = text.split()
    keywords = []
    
    for word in words:
        clean_word = word.strip('.,!?"\'')
        if not clean_word:
            continue
            
        score = analyzer.polarity_scores(clean_word)
        if abs(score['compound']) >= 0.1:
            keywords.append(clean_word.lower())
             
    return list(set(keywords))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "FeedSense ML Service",
        "message": "ML Service is running"
    }

@app.post("/predict")
async def predict_sentiment(request: TextRequest):
    """
    Analyze sentiment of the given text.
    
    Returns:
    - sentiment: Positive, Negative, or Neutral
    - confidenceScore: 0-100
    - detectedKeywords: List of sentiment-bearing words
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    if len(request.text.strip()) < 3:
        raise HTTPException(status_code=400, detail="Text must be at least 3 characters")
        
    try:
        # Get VADER scores
        scores = analyzer.polarity_scores(request.text)
        
        compound = scores['compound']
        
        # Categorize Sentiment
        if compound >= 0.05:
            sentiment = "Positive"
        elif compound <= -0.05:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
            
        # Calculate Confidence
        if sentiment == "Neutral":
            confidence = round(scores['neu'] * 100)
        else:
            confidence = round(abs(compound) * 100)
            
        # Ensure confidence is within 0-100 bounds
        confidence = max(0, min(100, confidence))
        
        # Extract keywords
        detected_keywords = get_vader_keywords(request.text)
        
        return {
            "sentiment": sentiment,
            "confidenceScore": confidence,
            "detectedKeywords": detected_keywords,
            "debug_vader_scores": scores
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 5001))
    uvicorn.run(app, host="0.0.0.0", port=port)
