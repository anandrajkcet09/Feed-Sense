from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI
app = FastAPI(title="FeedSense ML Service", version="1.0.0")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the VADER analyzer
try:
    analyzer = SentimentIntensityAnalyzer()
    print("VADER Analyzer initialized successfully!")
except Exception as e:
    print(f"Failed to initialize VADER: {e}")

# Define the request payload
class TextRequest(BaseModel):
    text: str

def get_vader_keywords(text: str):
    """
    Extracts words that strongly influence the VADER score.
    """
    words = text.split()
    keywords = []
    
    # Analyze individual words to find strong positive/negative contributors
    for word in words:
        # Strip simple punctuation for checking
        clean_word = word.strip('.,!?"\'')
        if not clean_word:
            continue
            
        score = analyzer.polarity_scores(clean_word)
        # If the word itself has a non-zero compound score, it's a keyword
        if abs(score['compound']) >= 0.1:
             keywords.append(clean_word.lower())
             
    return list(set(keywords))

@app.post("/predict")
async def predict_sentiment(request: TextRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        # Get VADER scores
        # Returns a dict like: {'neg': 0.0, 'neu': 0.295, 'pos': 0.705, 'compound': 0.8016}
        scores = analyzer.polarity_scores(request.text)
        
        compound = scores['compound']
        
        # Categorize Sentiment
        if compound >= 0.05:
            sentiment = "Positive"
        elif compound <= -0.05:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
            
        # Map compound score (-1 to 1) to Confidence Percentage (0 to 100)
        # We take the absolute value of the compound score, as both strong positive 
        # and strong negative mean high confidence in that emotion.
        # If neutral, we use the neutral probability score.
        if sentiment == "Neutral":
             confidence = round(scores['neu'] * 100)
        else:
             confidence = round(abs(compound) * 100)
             
        # Ensure confidence is within 0-100 bounds
        confidence = max(0, min(100, confidence))
        
        # Extract keywords that influenced the score
        detected_keywords = get_vader_keywords(request.text)
        
        return {
            "sentiment": sentiment,
            "confidenceScore": confidence,
            "detectedKeywords": detected_keywords,
            "debug_vader_scores": scores # Keep for debugging
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "ML Service is running"}

if __name__ == "__main__":
    import uvicorn
    # Make sure this runs on port 5001 so it doesn't conflict with the Node.js backend
    uvicorn.run(app, host="0.0.0.0", port=5001)
