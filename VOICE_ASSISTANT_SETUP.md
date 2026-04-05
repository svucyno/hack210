# Voice Assistant Setup Guide

## Overview

This guide will help you set up the API-based Voice Assistant with multi-key failover system.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- API keys for:
  - OpenAI (Whisper API)
  - Groq (AI responses)
  - ElevenLabs (Text-to-Speech)

## Step 1: Obtain API Keys

### OpenAI API Keys (Whisper)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Repeat to create a second key for failover

**Pricing**: Pay-as-you-go, ~$0.006 per minute of audio

### Groq API Keys

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign in or create an account
3. Click "Create API Key"
4. Copy the key (starts with `gsk_`)
5. Repeat to create a second key for failover

**Pricing**: Free tier available with rate limits

### ElevenLabs API Keys

1. Go to [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys)
2. Sign in or create an account
3. Click "Generate API Key"
4. Copy the key
5. Repeat to create a second key for failover

**Pricing**: Free tier: 10,000 characters/month, Paid plans available

## Step 2: Configure Environment Variables

1. Open `.env` file in the project root
2. Add your API keys:

```bash
# OpenAI Whisper API Keys
OPENAI_API_KEY_1=sk-your_first_openai_key_here
OPENAI_API_KEY_2=sk-your_second_openai_key_here

# Groq API Keys
GROQ_API_KEY_1=gsk_your_first_groq_key_here
GROQ_API_KEY_2=gsk_your_second_groq_key_here

# ElevenLabs API Keys
ELEVENLABS_API_KEY_1=your_first_elevenlabs_key_here
ELEVENLABS_API_KEY_2=your_second_elevenlabs_key_here

# Backend Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
VITE_VOICE_BACKEND_URL=http://localhost:3001
```

**Important**: 
- At least one API key is required for each service
- Second keys are optional but recommended for failover
- Never commit `.env` file to version control

## Step 3: Install Dependencies

```bash
cd agridash-your-farming-partner
npm install
```

This installs all required packages including:
- express, multer, cors, axios, form-data, dotenv (backend)
- React, TypeScript, Vite (frontend)

## Step 4: Start the Application

### Option 1: Run Both Frontend and Backend Together

```bash
npm run dev:all
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Step 5: Test the Voice Assistant

1. Open browser to http://localhost:5173
2. Navigate to `/voice` route
3. Click "Start Recording"
4. Allow microphone permissions when prompted
5. Speak your question in Telugu or English
6. Click "Stop Recording"
7. Wait for processing (5-15 seconds)
8. Listen to the AI response

## Troubleshooting

### "Missing required environment variables"

**Problem**: Backend won't start

**Solution**: 
- Check that `.env` file exists
- Verify at least one API key is configured for each service
- Ensure no typos in environment variable names

### "Microphone access denied"

**Problem**: Can't record audio

**Solution**:
- Click the microphone icon in browser address bar
- Allow microphone access
- Refresh the page
- Try again

### "All API keys failed"

**Problem**: API requests failing

**Solution**:
- Verify API keys are valid
- Check API key quotas on service dashboards
- Ensure network connectivity
- Check console logs for specific error messages

### "Invalid file type"

**Problem**: Audio upload rejected

**Solution**:
- Browser may be using unsupported audio format
- Try different browser (Chrome/Edge recommended)
- Check browser MediaRecorder support

### Backend won't start on port 3001

**Problem**: Port already in use

**Solution**:
- Change PORT in `.env` file
- Update VITE_VOICE_BACKEND_URL to match
- Kill process using port 3001

## Development vs Production

### Development Setup (Current)

- Backend runs on localhost:3001
- Frontend runs on localhost:5173
- CORS enabled for local development
- Detailed logging enabled

### Production Deployment

1. **Backend Deployment**:
   - Deploy to cloud service (Heroku, Railway, AWS, etc.)
   - Set environment variables in hosting platform
   - Update CORS to allow production domain
   - Enable HTTPS (required for microphone access)

2. **Frontend Configuration**:
   - Update `VITE_VOICE_BACKEND_URL` to production backend URL
   - Build frontend: `npm run build`
   - Deploy dist folder to hosting service

3. **Security Considerations**:
   - Add rate limiting
   - Implement authentication
   - Monitor API usage
   - Set up error tracking

## Multi-Key Failover System

The system automatically handles API key failures:

1. **Primary Key**: First attempt uses KEY_1
2. **Failover**: If KEY_1 fails, automatically tries KEY_2
3. **Logging**: All attempts logged to console
4. **Error**: Only fails if all keys fail

**Benefits**:
- High availability
- No downtime during key rotation
- Automatic recovery from temporary failures

## Monitoring

Check backend console for:
- API key usage (which key is being used)
- Failover events (when keys fail)
- Processing times
- Error messages

Example log output:
```
[OPENAI] Attempting with key 1/2
[OPENAI] ✅ Success with key 1
[GROQ] Attempting with key 1/2
[GROQ] ❌ Key 1 failed: Rate limit exceeded
[GROQ] 🔄 Failing over to key 2
[GROQ] ✅ Success with key 2
```

## API Usage and Costs

### Estimated Costs per Request

- **Whisper**: ~$0.006 per minute of audio
- **Groq**: Free tier available
- **ElevenLabs**: ~$0.30 per 1000 characters (free tier: 10k chars/month)

### Example: 100 requests/day

- Average 30 seconds per audio: $9/month (Whisper)
- Average 100 characters per response: $90/month (ElevenLabs)
- Total: ~$99/month (excluding Groq free tier)

**Tip**: Use free tiers for development and testing

## Support and Resources

- **OpenAI Docs**: https://platform.openai.com/docs/guides/speech-to-text
- **Groq Docs**: https://console.groq.com/docs
- **ElevenLabs Docs**: https://elevenlabs.io/docs

## Next Steps

1. Test with different languages (Telugu and English)
2. Customize system prompt in `backend/services/groqService.js`
3. Change ElevenLabs voice in `backend/services/ttsService.js`
4. Add authentication for production use
5. Implement rate limiting
6. Set up monitoring and analytics
