import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Leaf, Droplet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LeafDetector from "@/components/LeafDetector";
import PesticideDetector from "@/components/PesticideDetector";
import ResultsDisplay from "@/components/ResultsDisplay";
import PesticideResultDisplay from "@/components/PesticideResultDisplay";
import type { DetectionResult, PesticideResult } from "@/services/diseaseService";
import { textToSpeech } from "@/services/ttsService";

type ActiveTab = 'leaf' | 'pesticide';

export default function DiseasePage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('leaf');
  
  // Results state
  const [diseaseResult, setDiseaseResult] = useState<DetectionResult | null>(null);
  const [pesticideResult, setPesticideResult] = useState<PesticideResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle disease detection result
   */
  const handleDiseaseResult = (result: DetectionResult) => {
    setDiseaseResult(result);
    setError(null);
    toast({
      title: "Success",
      description: "Disease detected successfully",
    });
  };

  /**
   * Handle pesticide recommendation result
   */
  const handlePesticideResult = (result: PesticideResult) => {
    setPesticideResult(result);
    setError(null);
    toast({
      title: "Success",
      description: "Pesticide recommendations ready",
    });
  };

  /**
   * Handle errors from child components
   */
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  /**
   * Handle read aloud functionality for disease results
   */
  const handleReadAloud = async () => {
    if (!diseaseResult) return;

    try {
      const textToRead = `${diseaseResult.diseaseName}. ${diseaseResult.description}. Treatment: ${diseaseResult.treatment}`;

      await textToSpeech({
        language: lang,
        text: textToRead,
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

  /**
   * Handle save result functionality
   */
  const handleSaveResult = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save results.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Coming Soon",
      description: "Result saving feature will be available soon.",
    });
  };

  /**
   * Handle new detection
   */
  const handleNewDetection = () => {
    setDiseaseResult(null);
    setPesticideResult(null);
    setError(null);
  };

  /**
   * Switch tabs
   */
  const handleTabSwitch = (tab: ActiveTab) => {
    setActiveTab(tab);
    setDiseaseResult(null);
    setPesticideResult(null);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-screen-md mx-auto px-4 py-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Disease Detection & Pesticide Finder
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-powered plant disease detection and pesticide recommendations
        </p>
      </div>

      {/* Tab Switcher */}
      {!diseaseResult && !pesticideResult && (
        <div className="relative flex gap-2 mb-6 p-1 rounded-2xl bg-[#141e14] border border-emerald-500/10">
          {/* Active Tab Indicator */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30"
            initial={false}
            animate={{
              left: activeTab === 'leaf' ? '0.25rem' : '50%',
              right: activeTab === 'leaf' ? '50%' : '0.25rem',
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />
          
          {/* Tab Buttons */}
          <button
            onClick={() => handleTabSwitch('leaf')}
            className={`relative flex-1 h-14 text-base font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'leaf'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Leaf className="h-5 w-5" />
            🌿 Leaf Detector
          </button>
          
          <button
            onClick={() => handleTabSwitch('pesticide')}
            className={`relative flex-1 h-14 text-base font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'pesticide'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Droplet className="h-5 w-5" />
            🧪 Pesticide Detector
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {diseaseResult ? (
        <ResultsDisplay
          result={diseaseResult}
          onNewDetection={handleNewDetection}
          onSaveResult={user ? handleSaveResult : undefined}
          onReadAloud={handleReadAloud}
        />
      ) : pesticideResult ? (
        <div className="space-y-4">
          <PesticideResultDisplay result={pesticideResult} />
          <Button
            onClick={handleNewDetection}
            className="w-full h-12"
            size="lg"
          >
            New Search
          </Button>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'leaf' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'leaf' ? 20 : -20 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {activeTab === 'leaf' ? (
            <LeafDetector
              language={lang}
              onResult={handleDiseaseResult}
              onError={handleError}
            />
          ) : (
            <PesticideDetector
              language={lang}
              onResult={handlePesticideResult}
              onError={handleError}
            />
          )}
        </motion.div>
      )}
    </div>
  );
}
