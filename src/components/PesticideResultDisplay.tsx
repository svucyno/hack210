import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import type { PesticideResult } from "@/services/diseaseService";

interface PesticideResultDisplayProps {
  result: PesticideResult;
}

export default function PesticideResultDisplay({ result }: PesticideResultDisplayProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recommended Pesticides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.recommendations.map((pesticide, index) => (
            <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{pesticide.name}</h3>
                <a
                  href={pesticide.buyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2"
                >
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Buy
                  </Button>
                </a>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Usage: </span>
                  <span className="text-gray-600">{pesticide.usage}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Precautions: </span>
                  <span className="text-gray-600">{pesticide.precautions}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
