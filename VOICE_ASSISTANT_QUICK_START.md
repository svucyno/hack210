# Voice Assistant Quick Start Guide

## 🚀 Quick Start (2 Steps)

### Step 1: Start Backend
```bash
cd agridash-your-farming-partner
npm run dev:backend
```

Wait for:
```
✅ Environment validation passed
🚀 Voice Assistant Backend Server
📡 Server running on http://localhost:3001
```

### Step 2: Start Frontend (in a new terminal)
```bash
cd agridash-your-farming-partner
npm run dev
```

## 🎤 How to Use

1. **Open the app** in your browser (usually `http://localhost:5173`)
2. **Look for the floating mic button** at the bottom-right corner (visible on all pages)
3. **Click the mic button** to open the voice assistant panel
4. **Click "Start Recording"** and speak your farming question
5. **Click "Stop Recording"** when done
6. **Wait for processing** (usually 5-10 seconds)
7. **See the response** as text and hear it spoken aloud

## 🔧 Troubleshooting

### "Failed to fetch" Error
- **Check**: Is the backend running? Look for the server message in terminal
- **Fix**: Run `npm run dev:backend` in the agridash-your-farming-partner folder

### Backend Won't Start
- **Check**: Are API keys configured in `.env`?
- **Fix**: Ensure these keys exist in `.env`:
  - `OPENAI_API_KEY_1`
  - `GROQ_API_KEY_1`
  - `ELEVENLABS_API_KEY_1`

### Microphone Not Working
- **Check**: Did you allow microphone permissions?
- **Fix**: Click "Allow" when browser asks for microphone access

### No Audio Response
- **Check**: Is your volume turned on?
- **Fix**: Check system volume and browser audio settings

## 📝 What Happens Behind the Scenes

```
Your Voice → Microphone → Frontend
                ↓
        Backend Server (Port 3001)
                ↓
        1. Whisper API (Speech-to-Text)
                ↓
        2. Groq API (AI Response)
                ↓
        3. ElevenLabs API (Text-to-Speech)
                ↓
        Audio Response → Frontend → Your Speakers
```

## 🎯 Features

✅ Floating mic button visible on all pages
✅ Modern, clean UI with animations
✅ Voice recording with visual feedback
✅ AI-powered farming assistance
✅ Text-to-speech responses
✅ Keyboard support (Escape to close)
✅ Mobile responsive
✅ Error handling with user-friendly messages

## 🔑 Environment Variables

Required in `.env`:
```env
# Voice Assistant Backend
VITE_VOICE_BACKEND_URL=http://localhost:3001

# Backend API Keys
OPENAI_API_KEY_1=your_openai_key_here
GROQ_API_KEY_1=your_groq_key_here
ELEVENLABS_API_KEY_1=your_elevenlabs_key_here
```

## 💡 Tips

- Speak clearly and at a normal pace
- Ask farming-related questions for best results
- The AI assistant understands both English and Telugu
- You can close the panel anytime by clicking the X or pressing Escape
- The floating button stays visible even when scrolling

## 🐛 Still Having Issues?

1. Check backend terminal for error messages
2. Check browser console (F12) for frontend errors
3. Verify all API keys are valid and have credits
4. Ensure you're using a supported browser (Chrome, Edge, Safari)
5. Check that port 3001 is not being used by another application
