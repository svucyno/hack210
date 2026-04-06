/**
 * Text-to-Speech Service using Google Cloud Text-to-Speech API
 * 
 * Supports Telugu, Hindi, and English TTS with high-quality neural voices
 */

interface TTSConfig {
  language: "en" | "hi" | "te";
  text: string;
}

/**
 * Convert text to speech using Google Cloud TTS
 * 
 * Voices used:
 * - Telugu: te-IN-Standard-A (Female, Neural)
 * - Hindi: hi-IN-Neural2-A (Female, Neural)
 * - English: en-IN-Neural2-A (Female, Neural)
 */
export async function textToSpeech(config: TTSConfig): Promise<void> {
  const { language, text } = config;

  // Clean text for TTS (remove markdown formatting)
  const cleanText = text.replace(/[#*_`\n]/g, " ").trim();

  console.log(`[TTS] Starting TTS for language: ${language}`);
  console.log(`[TTS] Text length: ${cleanText.length} characters`);

  // Get Google Cloud API key from environment
  const googleApiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

  if (!googleApiKey) {
    console.warn("[TTS] Google Cloud API key not configured. Falling back to browser TTS.");
    console.warn("[TTS] To use high-quality TTS, set VITE_GOOGLE_CLOUD_API_KEY in your .env file.");
    fallbackToBrowserTTS(cleanText, language);
    return;
  }

  console.log("[TTS] Google Cloud API key found, using high-quality TTS");

  try {
    // Select voice based on language (all female, highest quality voices)
    const voiceConfig = {
      te: {
        languageCode: "te-IN",
        name: "te-IN-Wavenet-A", // Female Telugu voice (WaveNet - highest quality)
        ssmlGender: "FEMALE"
      },
      hi: {
        languageCode: "hi-IN",
        name: "hi-IN-Wavenet-A", // Female Hindi voice (WaveNet)
        ssmlGender: "FEMALE"
      },
      en: {
        languageCode: "en-IN",
        name: "en-IN-Wavenet-A", // Female English voice (WaveNet)
        ssmlGender: "FEMALE"
      }
    };

    const voice = voiceConfig[language];

    console.log(`[TTS] Using Google Cloud voice: ${voice.name} (${voice.ssmlGender})`);

    // Call Google Cloud Text-to-Speech API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            text: cleanText.slice(0, 5000) // Google TTS supports up to 5000 chars
          },
          voice: {
            languageCode: voice.languageCode,
            name: voice.name,
            ssmlGender: voice.ssmlGender
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 0.85, // Slower for better clarity
            pitch: 2.0, // Higher pitch for clearer female voice
            volumeGainDb: 2.0, // Slightly louder
            effectsProfileId: ["headphone-class-device"] // Optimized for clarity
          }
        }),
      }
    );

    console.log(`[TTS] API Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[TTS] Google Cloud TTS error:", errorData);
      
      // Check for invalid API key
      if (response.status === 400 && errorData.error?.message?.includes("API key")) {
        console.error("[TTS] Invalid API key. Please check VITE_GOOGLE_CLOUD_API_KEY in .env file.");
        throw new Error(`Invalid API key: ${errorData.error.message}`);
      }
      
      throw new Error(`TTS API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    // Get audio content from response
    const data = await response.json();
    
    if (!data.audioContent) {
      throw new Error("No audio content in response");
    }

    // Decode base64 audio
    const audioBytes = atob(data.audioContent);
    const audioArray = new Uint8Array(audioBytes.length);
    for (let i = 0; i < audioBytes.length; i++) {
      audioArray[i] = audioBytes.charCodeAt(i);
    }
    
    const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
    console.log(`[TTS] Received audio blob: ${audioBlob.size} bytes`);

    // Create audio element and play
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Play audio
    console.log("[TTS] Playing audio...");
    await audio.play();

    // Clean up URL after playing
    audio.onended = () => {
      console.log("[TTS] Audio playback completed");
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = (error) => {
      console.error("[TTS] Audio playback error:", error);
      URL.revokeObjectURL(audioUrl);
    };

  } catch (error) {
    console.error("[TTS] Error:", error);
    
    // Fallback to browser TTS if Google Cloud fails
    console.log("[TTS] Falling back to browser TTS");
    fallbackToBrowserTTS(cleanText, language);
  }
}

/**
 * Fallback to browser's built-in speech synthesis
 */
function fallbackToBrowserTTS(text: string, language: "en" | "hi" | "te"): void {
  console.log("[TTS] Using browser TTS fallback");
  
  if (!("speechSynthesis" in window)) {
    console.error("[TTS] Speech synthesis not supported in this browser");
    return;
  }

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const targetLang = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN";
  utterance.lang = targetLang;
  utterance.rate = 0.9;
  utterance.pitch = 1.2; // Slightly higher pitch for female voice

  // Try to find matching voice (prefer female)
  const setVoice = () => {
    const voices = speechSynthesis.getVoices();
    console.log(`[TTS] Available voices: ${voices.length}`);
    
    // Try to find a female voice first
    let matchingVoice = voices.find(voice =>
      voice.lang.startsWith(targetLang.split("-")[0]) && 
      (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman'))
    );
    
    // If no female voice, find any matching language voice
    if (!matchingVoice) {
      matchingVoice = voices.find(voice =>
        voice.lang.startsWith(targetLang.split("-")[0])
      );
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
      console.log(`[TTS] Using browser voice: ${matchingVoice.name} (${matchingVoice.lang})`);
    } else {
      console.warn(`[TTS] No browser voice found for ${targetLang}, using default`);
    }

    speechSynthesis.speak(utterance);
  };

  if (speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    speechSynthesis.onvoiceschanged = setVoice;
  }
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
}

/**
 * Check if TTS is currently speaking
 */
export function isSpeaking(): boolean {
  if ("speechSynthesis" in window) {
    return speechSynthesis.speaking;
  }
  return false;
}

/**
 * Speak text with language-specific voice configuration for Farmer Assistant
 * Uses browser's SpeechSynthesis API with optimized settings
 * 
 * @param text - The text to speak
 * @param language - The language code ('en' or 'te')
 */
export async function speakText(
  text: string,
  language: 'en' | 'te'
): Promise<void> {
  if (!('speechSynthesis' in window)) {
    console.error('[TTS] Speech synthesis not supported in this browser');
    return;
  }

  // Cancel any ongoing speech before starting new speech
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure voice based on language
  utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  // Try to find matching voice
  const setVoice = () => {
    const voices = speechSynthesis.getVoices();
    const targetLang = language === 'te' ? 'te' : 'en';
    
    const matchingVoice = voices.find(voice =>
      voice.lang.startsWith(targetLang)
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    speechSynthesis.speak(utterance);
  };

  if (speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    speechSynthesis.onvoiceschanged = setVoice;
  }
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}
