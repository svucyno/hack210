import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Upload, X } from "lucide-react";
import {
  validateImageFormat,
  getPesticideRecommendations,
  convertToBase64,
  callGeminiVisionAPI,
} from "@/services/diseaseService";
import type { PesticideResult } from "@/services/diseaseService";

interface PesticideDetectorProps {
  language: 'en' | 'hi' | 'te';
  onResult: (result: PesticideResult) => void;
  onError: (error: string) => void;
}

export default function PesticideDetector({ language, onResult, onError }: PesticideDetectorProps) {
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFormat(file);
    if (!validation.isValid) {
      setLocalError(validation.error || "Invalid image file");
      onError(validation.error || "Invalid image file");
      return;
    }

    setSelectedImage(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setLocalError(null);
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    setLocalError(null);
  };

  const handleFindPesticide = async () => {
    if (!inputText.trim() && !selectedImage) {
      setLocalError("Please enter disease name/problem or upload an image");
      onError("Please enter disease name/problem or upload an image");
      return;
    }

    setIsProcessing(true);
    setLocalError(null);

    try {
      let queryText = inputText.trim();

      // If image is provided, detect disease first
      if (selectedImage) {
        const base64Image = await convertToBase64(selectedImage);
        const detectedDisease = await callGeminiVisionAPI(base64Image);
        queryText = detectedDisease || queryText;
      }

      if (!queryText) {
        throw new Error("Could not determine disease from image");
      }

      const result = await getPesticideRecommendations(queryText, language);
      onResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get recommendations";
      setLocalError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {localError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{localError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Describe the problem or disease
            </label>
            <Textarea
              placeholder="e.g., Tomato leaf curl, Rice blast, or describe symptoms..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isProcessing}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or upload image
              </span>
            </div>
          </div>

          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                disabled={isProcessing}
                className="hidden"
                id="pesticide-image-upload"
              />
              <label
                htmlFor="pesticide-image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Upload plant image
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, or WebP (max 5MB)
                </span>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Plant preview"
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 shadow-lg"
                onClick={handleRemoveImage}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            onClick={handleFindPesticide}
            disabled={isProcessing || (!inputText.trim() && !selectedImage)}
            className="w-full h-12"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={20} />
                Finding Pesticides...
              </>
            ) : (
              "Find Pesticide"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
