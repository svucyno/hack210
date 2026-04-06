import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { CropAdvisorRequest, AdvisorResponse } from "@/types/cropAdvisorTypes";
import { getCropAdvice } from "@/services/cropAdvisorService";
import { CropAdvisorForm } from "@/components/CropAdvisorForm";
import { AdvisorResponseDisplay } from "@/components/AdvisorResponseDisplay";
import { useToast } from "@/hooks/use-toast";
import { textToSpeech } from "@/services/ttsService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function CropAdvisorPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AdvisorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: CropAdvisorRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Submitting crop advisor request:", formData);
      const response = await getCropAdvice(formData);

      setResult(response);
      setError(null);

      // Show success toast
      toast({
        title: t("cropAdvisorSuccessTitle"),
        description: t("cropAdvisorSuccessMessage"),
      });
    } catch (err) {
      console.error("Crop advisor error:", err);

      const errorMessage =
        err instanceof Error ? err.message : t("cropAdvisorUnknownError");

      setError(errorMessage);
      setResult(null);

      // Show error toast
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuery = () => {
    setResult(null);
    setError(null);
  };

  const handleReadAloud = async () => {
    if (!result) return;

    try {
      await textToSpeech({
        language: lang,
        text: result.output,
      });
    } catch (err) {
      console.error("TTS error:", err);
      toast({
        title: "Error",
        description: "Failed to read aloud. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Error Display */}
        {error && !result && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Show form when no result */}
        {!result && (
          <CropAdvisorForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}

        {/* Show response when available */}
        {result && (
          <AdvisorResponseDisplay
            response={result}
            onNewQuery={handleNewQuery}
            onReadAloud={handleReadAloud}
          />
        )}
      </div>
    </div>
  );
}
