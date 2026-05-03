# 🤖 KodNest AI Solver — Chrome Extension

A Chrome extension that adds a floating **"Solve with AI"** button on any webpage. It extracts questions from coding platforms like KodNest, sends them to Google Gemini AI, and returns complete Java solutions.

## Features

- 🔘 Floating "Solve with AI" button on every webpage
- 📄 Automatic question extraction from coding platforms
- 🤖 AI-powered solutions using Google Gemini 2.5 Flash
- ☕ Java-only code generation
- 🚀 Auto-fill code directly into the editor (bypasses paste restrictions)
- 📋 Copy answer to clipboard
- ⌨️ Keyboard shortcut: `Alt + K`
- 🔄 Auto-retry on rate limits

## Project Structure

```
AI_Extension/
├── manifest.json      # Chrome Extension manifest (v3)
├── content.js         # Floating button + modal + API call logic
├── content.css        # Dark-themed styles for button & modal
├── popup.html         # Extension popup (status, settings)
├── popup.js           # Popup logic
├── server.py          # Flask backend (Gemini AI)
├── .gitignore
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Setup

### 1. Install Dependencies
```bash
pip install flask flask-cors google-genai
```

### 2. Set Your Gemini API Key
Get a free key at [Google AI Studio](https://aistudio.google.com/apikey), then update `server.py`:
```python
client = genai.Client(api_key="YOUR_API_KEY_HERE")
```

### 3. Start the Backend
```bash
python server.py
```

### 4. Load Extension in Chrome
1. Open `chrome://extensions`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked** → select this folder
4. Visit any coding page and click **🤖 Solve with AI**

## Tech Stack

- **Frontend**: Chrome Extension (Manifest V3), Vanilla JS/CSS
- **Backend**: Python Flask
- **AI**: Google Gemini 2.5 Flash
