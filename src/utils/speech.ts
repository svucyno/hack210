export class SpeechService {
  private synthesis: SpeechSynthesis;
  private recognition: any;
  private isListening: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Initialize speech recognition if available
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";
    }
  }

  speak(text: string, lang: string = "en-US"): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  startListening(
    onResult: (transcript: string) => void,
    onError?: (error: any) => void
  ): void {
    if (!this.recognition) {
      onError?.(new Error("Speech recognition not supported"));
      return;
    }

    if (this.isListening) {
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      this.isListening = false;
    };

    this.recognition.onerror = (event: any) => {
      onError?.(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
    this.isListening = true;
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isSupported(): boolean {
    return !!(this.synthesis && this.recognition);
  }

  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

// Singleton instance
export const speechService = new SpeechService();

// Helper functions
export function speak(text: string, lang?: string): Promise<void> {
  return speechService.speak(text, lang);
}

export function stopSpeaking(): void {
  speechService.stop();
}

export function startListening(
  onResult: (transcript: string) => void,
  onError?: (error: any) => void
): void {
  speechService.startListening(onResult, onError);
}

export function stopListening(): void {
  speechService.stopListening();
}

export function isSpeechSupported(): boolean {
  return speechService.isSupported();
}
