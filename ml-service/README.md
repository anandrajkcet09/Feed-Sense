# FeedSense ML Service

## Setup Instructions

1. **Create and activate a Python virtual environment:**
   
   ```bash
   cd ml-service
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the ML service:**
   
   ```bash
   python main.py
   ```

4. **Service runs on:**
   
   - Default: `http://localhost:8000` (check `main.py` for port).
