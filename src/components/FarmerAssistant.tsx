import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Volume2 } from 'lucide-react';
import { getFarmerAdvice } from '../services/farmerService';
import { speakText } from '../services/ttsService';
import type { Language } from '../types/farmerAssistantTypes';

export function FarmerAssistant() {
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
  };

  const handleSubmit = async () => {
    // Validate input
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    // Clear previous response and error
    setResponse(null);
    setError(null);
    setIsLoading(true);

    try {
      const result = await getFarmerAdvice(question, language);
      setResponse(result.output);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Try again later';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (response) {
      speakText(response, language);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setResponse(null);
    setError(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Farmer Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Selector */}
        <div className="flex gap-2">
          <Button
            variant={language === 'en' ? 'default' : 'outline'}
            onClick={() => handleLanguageChange('en')}
            disabled={isLoading}
          >
            English
          </Button>
          <Button
            variant={language === 'te' ? 'default' : 'outline'}
            onClick={() => handleLanguageChange('te')}
            disabled={isLoading}
          >
            Telugu
          </Button>
        </div>

        {/* Question Input */}
        <Textarea
          value={question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder={
            language === 'en'
              ? 'Ask your farming question...'
              : 'మీ వ్యవసాయ ప్రశ్న అడగండి...'
          }
          rows={4}
          disabled={isLoading}
          className="resize-none"
        />

        {/* Ask Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !question.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'en' ? 'Getting advice...' : 'సలహా పొందుతోంది...'}
            </>
          ) : (
            language === 'en' ? 'Ask' : 'అడగండి'
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Response Display */}
        {response && (
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <div className="whitespace-pre-wrap">{response}</div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSpeak}
                variant="outline"
                size="sm"
              >
                <Volume2 className="mr-2 h-4 w-4" />
                {language === 'en' ? 'Speak' : 'మాట్లాడండి'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
              >
                {language === 'en' ? 'Ask Another' : 'మరొకటి అడగండి'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
