# Plant.id Disease Detection Setup Guide

This guide will help you set up the Plant.id Disease Detection feature for the AgriDash application.

## Overview

The disease detection feature uses Plant.id API as the primary service for plant and disease identification, with PlantNet API as a fallback option. The system provides:

- Plant species identification
- Disease detection with confidence scores
- Treatment recommendations
- Pesticide suggestions with Amazon India purchase links
- Organic treatment alternatives
- Multilingual support (English, Hindi, Telugu)

## Prerequisites

- Node.js 18+ installed
- AgriDash project cloned and dependencies installed
- Internet connection for API calls

## Step 1: Obtain Plant.id API Key

Plant.id is the primary API for disease detection.

1. Visit [https://web.plant.id/](https://web.plant.id/)
2. Click "Sign Up" or "Get API Access"
3. Create a free account
4. Navigate to your dashboard
5. Click "API Access Token" or "Get API Key"
6. Copy your API key

### Plant.id API Features

- Plant identification from images
- Disease and pest detection
- Health assessment
- Confidence scores
- Treatment suggestions

### Free Tier Limits

- 100 requests per month (free tier)
- Paid plans available for higher usage

## Step 2: Obtain PlantNet API Key (Optional Fallback)

PlantNet provides plant identification as a fallback when Plant.id is unavailable.

1. Visit [https://my.plantnet.org/](https://my.plantnet.org/)
2. Create an account
3. Navigate to "API" section
4. Generate an API key
5. Copy your API key

### PlantNet API Features

- Plant species identification
- Confidence scores
- Note: Does NOT provide disease detection (only plant identification)

### Free Tier Limits

- 500 requests per day (free tier)
- Rate limited to prevent abuse

## Step 3: Configure Environment Variables

1. Open the `.env` file in the project root
2. Add your API keys:

```env
# Plant.id API Key (Primary)
VITE_PLANT_ID_API_KEY=your_plant_id_api_key_here

# PlantNet API Key (Fallback - Optional)
VITE_PLANTNET_API_KEY=your_plantnet_api_key_here
```

3. Save the file

### Optional: Custom API Endpoints

If you need to use custom API endpoints, you can override the defaults:

```env
# Optional: Custom API endpoints
VITE_PLANT_ID_API_URL=https://api.plant.id/v2/identify
VITE_PLANTNET_API_URL=https://my-api.plantnet.org/v2/identify/all
```

## Step 4: Verify Installation

1. Start the development server:
```bash
npm run dev
```

2. Navigate to the Disease Detection page
3. Upload a plant image
4. Click "Detect Disease"
5. Verify that the API returns results

## API Request/Response Examples

### Plant.id API Request

```json
{
  "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRg..."],
  "modifiers": ["health_assessment", "disease_similar_images"],
  "plant_details": ["common_names", "taxonomy", "url"]
}
```

### Plant.id API Response

```json
{
  "suggestions": [
    {
      "plant_name": "Solanum lycopersicum",
      "plant_details": {
        "common_names": ["Tomato", "टमाटर", "టమాటా"]
      },
      "probability": 0.95
    }
  ],
  "health_assessment": {
    "is_healthy": false,
    "diseases": [
      {
        "name": "late blight",
        "probability": 0.87,
        "disease_details": {
          "description": "Late blight is caused by Phytophthora infestans...",
          "treatment": "Apply copper-based fungicides..."
        }
      }
    ]
  }
}
```

### PlantNet API Request

```json
{
  "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRg..."],
  "organs": ["leaf"]
}
```

### PlantNet API Response

```json
{
  "results": [
    {
      "score": 0.92,
      "species": {
        "scientificNameWithoutAuthor": "Solanum lycopersicum",
        "commonNames": ["Tomato", "Garden tomato"]
      }
    }
  ]
}
```

## Key Response Fields

### Plant.id Response Fields

- `suggestions[0].plant_name` - Scientific plant name
- `suggestions[0].plant_details.common_names[0]` - Common plant name
- `suggestions[0].probability` - Plant identification confidence (0-1)
- `health_assessment.is_healthy` - Whether plant is healthy
- `health_assessment.diseases[0].name` - Disease name
- `health_assessment.diseases[0].probability` - Disease confidence (0-1)
- `health_assessment.diseases[0].disease_details.description` - Disease description
- `health_assessment.diseases[0].disease_details.treatment` - Treatment info

### PlantNet Response Fields

- `results[0].species.scientificNameWithoutAuthor` - Scientific name
- `results[0].species.commonNames[0]` - Common name
- `results[0].score` - Identification confidence (0-1)

## Troubleshooting

### Error: "Plant.id API key not configured"

**Solution:** Ensure `VITE_PLANT_ID_API_KEY` is set in your `.env` file and restart the dev server.

### Error: "Authentication failed"

**Solution:** Verify your API key is correct and hasn't expired. Check your Plant.id dashboard.

### Error: "Rate limit exceeded"

**Solution:** You've exceeded your free tier limit. Wait for the limit to reset or upgrade your plan.

### Error: "Request timeout"

**Solution:** Check your internet connection. The API has a 30-second timeout.

### Both APIs Failing

**Solution:** 
1. Check internet connection
2. Verify API keys are correct
3. Check API service status
4. Review browser console for detailed error messages

## Local Disease Knowledge Base

The application includes a local disease knowledge base at `src/data/diseaseDatabase.json` with:

- 10+ common crop diseases
- Multilingual symptoms (English, Hindi, Telugu)
- Treatment instructions
- Pesticide recommendations with Amazon India links
- Organic treatment alternatives

### Adding New Diseases

To add a new disease to the knowledge base:

1. Open `src/data/diseaseDatabase.json`
2. Add a new entry following this schema:

```json
{
  "diseaseName": "Disease_Name",
  "symptoms": {
    "en": ["Symptom 1", "Symptom 2"],
    "hi": ["लक्षण 1", "लक्षण 2"],
    "te": ["లక్షణం 1", "లక్షణం 2"]
  },
  "description": {
    "en": "Disease description",
    "hi": "रोग विवरण",
    "te": "వ్యాధి వివరణ"
  },
  "treatment": {
    "en": "Treatment instructions",
    "hi": "उपचार निर्देश",
    "te": "చికిత్స సూచనలు"
  },
  "pesticides": [
    {
      "name": "Pesticide Name",
      "buyLink": "https://www.amazon.in/s?k=pesticide+name"
    }
  ],
  "organicSolutions": {
    "en": ["Solution 1", "Solution 2"],
    "hi": ["समाधान 1", "समाधान 2"],
    "te": ["పరిష్కారం 1", "పరిష్కారం 2"]
  }
}
```

## Best Practices

1. **Image Quality**: Use clear, well-lit images of affected plant parts
2. **Image Size**: Keep images under 5MB (automatically compressed if larger than 1MB)
3. **Supported Formats**: JPEG, PNG, WebP
4. **API Key Security**: Never commit API keys to version control
5. **Error Handling**: Always handle API failures gracefully with user-friendly messages
6. **Rate Limiting**: Monitor API usage to stay within free tier limits

## Production Deployment

For production deployment:

1. Use environment variables for API keys (never hardcode)
2. Consider implementing server-side API calls to hide API keys
3. Add request caching to reduce API calls
4. Implement rate limiting on your backend
5. Monitor API usage and costs
6. Set up error tracking (e.g., Sentry)

## Support

For issues or questions:

- Plant.id Support: [https://web.plant.id/support](https://web.plant.id/support)
- PlantNet Support: [https://my.plantnet.org/contact](https://my.plantnet.org/contact)
- AgriDash Issues: Create an issue in the project repository

## Additional Resources

- [Plant.id API Documentation](https://github.com/flowerchecker/Plant-id-API/wiki)
- [PlantNet API Documentation](https://my.plantnet.org/page/api)
- [AgriDash Documentation](../README.md)
