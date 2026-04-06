import { useI18n } from "@/lib/i18n";
import type { AdvisorResponse } from "@/types/cropAdvisorTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Volume2 } from "lucide-react";

interface AdvisorResponseDisplayProps {
  response: AdvisorResponse;
  onNewQuery: () => void;
  onReadAloud?: () => void;
}

export function AdvisorResponseDisplay({
  response,
  onNewQuery,
  onReadAloud,
}: AdvisorResponseDisplayProps) {
  const { t } = useI18n();

  // Parse the response output into sections
  const parseOutput = (output: string) => {
    const lines = output.split("\n").filter((line) => line.trim());

    const sections: {
      summary: string[];
      recommendations: string[];
      additionalAdvice: string[];
    } = {
      summary: [],
      recommendations: [],
      additionalAdvice: [],
    };

    let currentSection: "summary" | "recommendations" | "additionalAdvice" =
      "summary";

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (
        lowerLine.includes("recommendation") ||
        lowerLine.startsWith("-") ||
        lowerLine.startsWith("•")
      ) {
        currentSection = "recommendations";
        sections.recommendations.push(line);
      } else if (
        lowerLine.includes("additional") ||
        lowerLine.includes("note:")
      ) {
        currentSection = "additionalAdvice";
        sections.additionalAdvice.push(line);
      } else {
        sections[currentSection].push(line);
      }
    }

    return sections;
  };

  const sections = parseOutput(response.output);

  // Format timestamp
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("cropAdvisorResponseTitle")}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {t("cropAdvisorTimestamp")}: {formatTimestamp(response.timestamp)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {/* Summary Section */}
            {sections.summary.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Summary</h3>
                <div className="space-y-2">
                  {sections.summary.map((line, index) => (
                    <p key={index} className="text-sm leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations Section */}
            {sections.recommendations.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Recommendations
                  </h3>
                  <ul className="space-y-2 list-disc list-inside">
                    {sections.recommendations.map((line, index) => (
                      <li key={index} className="text-sm leading-relaxed">
                        {line.replace(/^[-•]\s*/, "")}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Additional Advice Section */}
            {sections.additionalAdvice.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Additional Advice
                  </h3>
                  <div className="space-y-2">
                    {sections.additionalAdvice.map((line, index) => (
                      <p key={index} className="text-sm leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Fallback: Display raw output if no sections parsed */}
            {sections.summary.length === 0 &&
              sections.recommendations.length === 0 &&
              sections.additionalAdvice.length === 0 && (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {response.output}
                </div>
              )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onNewQuery}
            variant="outline"
            className="flex-1"
            aria-label={t("cropAdvisorNewQuery")}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("cropAdvisorNewQuery")}
          </Button>
          {onReadAloud && (
            <Button
              onClick={onReadAloud}
              variant="outline"
              className="flex-1"
              aria-label={t("cropAdvisorReadAloud")}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              {t("cropAdvisorReadAloud")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
