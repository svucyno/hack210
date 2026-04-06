import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import type { CropAdvisorRequest } from "@/types/cropAdvisorTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface CropAdvisorFormProps {
  onSubmit: (data: CropAdvisorRequest) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export function CropAdvisorForm({
  onSubmit,
  isLoading,
  disabled = false,
}: CropAdvisorFormProps) {
  const { t } = useI18n();

  const [formData, setFormData] = useState<CropAdvisorRequest>({
    crop: "",
    location: "",
    season: "",
    soil: "",
    water: "",
    problem: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate a single field
  const validateField = (name: keyof CropAdvisorRequest, value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return t("cropAdvisorRequired");
    }

    if (name === "problem") {
      if (trimmedValue.length < 10) {
        return `Please enter at least 10 characters`;
      }
      if (trimmedValue.length > 500) {
        return `Maximum 500 characters allowed`;
      }
    } else {
      if (trimmedValue.length < 2) {
        return `Please enter at least 2 characters`;
      }
      if (trimmedValue.length > 100) {
        return `Maximum 100 characters allowed`;
      }
    }

    return "";
  };

  // Validate all fields
  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof CropAdvisorRequest>).forEach(
      (key) => {
        const error = validateField(key, formData[key]);
        if (error) {
          errors[key] = error;
          isValid = false;
        }
      }
    );

    setValidationErrors(errors);
    return isValid;
  };

  // Check if form is valid
  const isFormValid = () => {
    return (Object.keys(formData) as Array<keyof CropAdvisorRequest>).every(
      (key) => {
        const trimmedValue = formData[key].trim();
        if (!trimmedValue) return false;
        if (key === "problem") {
          return trimmedValue.length >= 10 && trimmedValue.length <= 500;
        }
        return trimmedValue.length >= 2 && trimmedValue.length <= 100;
      }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (touched[name] && validationErrors[name]) {
      const error = validateField(name as keyof CropAdvisorRequest, value);
      setValidationErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name as keyof CropAdvisorRequest, value);
    setValidationErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    // Trim all values before submission
    const trimmedData: CropAdvisorRequest = {
      crop: formData.crop.trim(),
      location: formData.location.trim(),
      season: formData.season.trim(),
      soil: formData.soil.trim(),
      water: formData.water.trim(),
      problem: formData.problem.trim(),
    };

    await onSubmit(trimmedData);
  };

  const isDisabled = disabled || isLoading;

  return (
    <Card className="w-full rounded-2xl bg-[#141e14] border border-emerald-500/10">
      <CardHeader>
        <CardTitle className="text-slate-200">{t("cropAdvisorTitle")}</CardTitle>
        <p className="text-sm text-slate-400">
          {t("cropAdvisorSubtitle")}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Crop */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Label htmlFor="crop" className="text-slate-400">{t("cropAdvisorCrop")}</Label>
            <Input
              id="crop"
              name="crop"
              value={formData.crop}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("cropAdvisorCropPlaceholder")}
              disabled={isDisabled}
              aria-label={t("cropAdvisorCrop")}
              aria-invalid={touched.crop && !!validationErrors.crop}
              className="bg-[#0d1410] border-emerald-500/20 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300"
            />
            {touched.crop && validationErrors.crop && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">
                  {validationErrors.crop}
                </AlertDescription>
              </Alert>
            )}
          </motion.div>

          {/* Location */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Label htmlFor="location" className="text-slate-400">{t("cropAdvisorLocation")}</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("cropAdvisorLocationPlaceholder")}
              disabled={isDisabled}
              aria-label={t("cropAdvisorLocation")}
              aria-invalid={touched.location && !!validationErrors.location}
              className="bg-[#0d1410] border-emerald-500/20 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300"
            />
            {touched.location && validationErrors.location && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">
                  {validationErrors.location}
                </AlertDescription>
              </Alert>
            )}
          </motion.div>

          {/* Season */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Label htmlFor="season" className="text-slate-400">{t("cropAdvisorSeason")}</Label>
            <Input
              id="season"
              name="season"
              value={formData.season}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("cropAdvisorSeasonPlaceholder")}
              disabled={isDisabled}
              aria-label={t("cropAdvisorSeason")}
              aria-invalid={touched.season && !!validationErrors.season}
              className="bg-[#0d1410] border-emerald-500/20 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300"
            />
            {touched.season && validationErrors.season && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">
                  {validationErrors.season}
                </AlertDescription>
              </Alert>
            )}
          </motion.div>

          {/* Soil */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Label htmlFor="soil" className="text-slate-400">{t("cropAdvisorSoil")}</Label>
            <Input
              id="soil"
              name="soil"
              value={formData.soil}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("cropAdvisorSoilPlaceholder")}
              disabled={isDisabled}
              aria-label={t("cropAdvisorSoil")}
              aria-invalid={touched.soil && !!validationErrors.soil}
              className="bg-[#0d1410] border-emerald-500/20 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300"
            />
            {touched.soil && validationErrors.soil && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">
                  {validationErrors.soil}
                </AlertDescription>
              </Alert>
            )}
          </motion.div>

          {/* Water */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Label htmlFor="water" className="text-slate-400">{t("cropAdvisorWater")}</Label>
            <Input
              id="water"
              name="water"
              value={formData.water}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("cropAdvisorWaterPlaceholder")}
              disabled={isDisabled}
              aria-label={t("cropAdvisorWater")}
              aria-invalid={touched.water && !!validationErrors.water}
              className="bg-[#0d1410] border-emerald-500/20 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300"
            />
            {touched.water && validationErrors.water && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">
                  {validationErrors.water}
                </AlertDescription>
              </Alert>
            )}
          </motion.div>

          {/* Problem */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <Label htmlFor="problem" className="text-slate-400">{t("cropAdvisorProblem")}</Label>
            <Textarea
              id="problem"
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("cropAdvisorProblemPlaceholder")}
              disabled={isDisabled}
              rows={4}
              aria-label={t("cropAdvisorProblem")}
              aria-invalid={touched.problem && !!validationErrors.problem}
              className="bg-[#0d1410] border-emerald-500/20 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-300 resize-none"
            />
            {touched.problem && validationErrors.problem && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">
                  {validationErrors.problem}
                </AlertDescription>
              </Alert>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
              disabled={isDisabled || !isFormValid()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("cropAdvisorSubmitting")}
                </>
              ) : (
                t("cropAdvisorSubmit")
              )}
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
}
