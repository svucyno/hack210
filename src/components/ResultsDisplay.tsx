import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Camera, Save, Volume2 } from "lucide-react";
import { DetectionResult, getConfidenceColor } from "@/services/diseaseService";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

export interface ResultsDisplayProps {
  result: DetectionResult;
  onNewDetection: () => void;
  onSaveResult?: () => void;
  onReadAloud?: () => void;
}

export default function ResultsDisplay({
  result,
  onNewDetection,
  onSaveResult,
  onReadAloud,
}: ResultsDisplayProps) {
  const { t, lang } = useI18n();

  // Get confidence color based on score
  const confidenceColor = getConfidenceColor(result.confidence);
  
  // Determine progress bar color variant
  const getProgressColor = (confidence: number): string => {
    if (confidence > 80) return "bg-green-600";
    if (confidence >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  // Format disease name for display (remove underscores, proper casing)
  const formatDiseaseName = (name: string): string => {
    return name
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Disease Name and Confidence Card */}
      <Card className="bg-[#141e14] border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-200">
            {formatDiseaseName(result.diseaseName)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-400">
                {t("disease.confidence" as any)}
              </span>
              <span className={`text-lg font-bold ${confidenceColor}`}>
                {result.confidence.toFixed(1)}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor(result.confidence)} transition-all duration-500`}
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Low Confidence Warning */}
          {result.confidence < 50 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t("disease.warnings.lowConfidence" as any) || "Low confidence detection. Please consult an expert for confirmation."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Treatment Suggestions Card */}
      <Card className="bg-[#141e14] border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-emerald-400">
            {t("disease.treatment" as any)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description/Causes */}
          {result.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-slate-300">
                {t("disease.description" as any) || "Description"}
              </h3>
              <div className="text-sm leading-relaxed space-y-1 text-slate-400">
                {result.description.split('\n').map((line, index) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return null;
                  
                  // Check if line starts with bullet point
                  if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                    return (
                      <div key={index} className="ml-4">
                        {trimmedLine}
                      </div>
                    );
                  }
                  
                  return (
                    <div key={index}>
                      {trimmedLine}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Symptoms */}
          {result.symptoms && result.symptoms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-slate-300">
                {t("disease.symptoms" as any)}
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {result.symptoms.map((symptom, index) => (
                  <li key={index} className="text-sm leading-relaxed text-slate-400">
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatment Instructions */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-300">
              {t("disease.treatmentInstructions" as any) || "Treatment"}
            </h3>
            <div className="text-sm leading-relaxed space-y-1 text-slate-400">
              {result.treatment.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;
                
                // Check if line starts with bullet point
                if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                  return (
                    <div key={index} className="ml-4">
                      {trimmedLine}
                    </div>
                  );
                }
                
                return (
                  <div key={index}>
                    {trimmedLine}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Pesticides with Amazon Links */}
          {result.pesticides && result.pesticides.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-emerald-400">
                Recommended Products
              </h3>
              <ul className="space-y-2">
                {result.pesticides.map((pesticide, index) => (
                  <li key={index} className="text-sm flex items-center justify-between">
                    <span className="font-medium text-slate-300">{pesticide.name}</span>
                    <a
                      href={pesticide.buyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-emerald-400 hover:text-emerald-300 underline text-xs transition-colors"
                    >
                      Buy on Amazon →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prevention Tips / Organic Solutions */}
          {result.organicSolutions && result.organicSolutions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-slate-300">
                {t("disease.organicSolutions" as any) || "Prevention Tips"}
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {result.organicSolutions.map((solution, index) => (
                  <li key={index} className="text-sm leading-relaxed text-slate-400">
                    {solution}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* New Detection Button */}
        <Button
          onClick={onNewDetection}
          className="flex-1 h-auto min-h-[44px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          variant="default"
        >
          <Camera className="mr-2" size={20} />
          {t("disease.newDetection" as any)}
        </Button>

        {/* Save Result Button (Optional) */}
        {onSaveResult && (
          <Button
            onClick={onSaveResult}
            className="flex-1 h-auto min-h-[44px] py-3 px-4 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors"
            variant="outline"
          >
            <Save className="mr-2" size={20} />
            {t("disease.saveResult" as any)}
          </Button>
        )}

        {/* Read Aloud Button (Optional) */}
        {onReadAloud && (
          <Button
            onClick={onReadAloud}
            className="flex-1 h-auto min-h-[44px] py-3 px-4 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors"
            variant="outline"
          >
            <Volume2 className="mr-2" size={20} />
            {t("disease.readAloud" as any)}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
