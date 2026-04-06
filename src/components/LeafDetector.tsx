import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Upload, X } from "lucide-react";
import {
  validateImageFormat,
  detectDiseaseFromFile,
  DetectionResult,
  DiseaseInput,
} from "@/services/diseaseService";

interface LeafDetectorProps {
  language: 'en' | 'hi' | 'te';
  onResult: (result: DetectionResult) => void;
  onError: (error: string) => void;
}

export default function LeafDetector({ language, onResult, onError }: LeafDetectorProps) {
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

  const handleDetect = async () => {
    if (!selectedImage) {
      setLocalError("Please upload an image");
      onError("Please upload an image");
      return;
    }

    setIsProcessing(true);
    setLocalError(null);

    try {
      const input: DiseaseInput = {
        symptoms: "Image analysis",
      };

      const result = await detectDiseaseFromFile(selectedImage, input, language);
      onResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to detect disease";
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
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                disabled={isProcessing}
                className="hidden"
                id="leaf-image-upload"
              />
              <label
                htmlFor="leaf-image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <span className="text-base font-medium text-gray-700 mb-1">
                  Upload Leaf Image
                </span>
                <span className="text-sm text-gray-500">
                  JPEG, PNG, or WebP (max 5MB)
                </span>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Leaf preview"
                className="w-full h-64 object-cover rounded-lg shadow-md"
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
            onClick={handleDetect}
            disabled={isProcessing || !selectedImage}
            className="w-full h-12"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={20} />
                Detecting Disease...
              </>
            ) : (
              "Detect Disease"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
