import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ResultsDisplay from "./ResultsDisplay";
import { DetectionResult } from "@/services/diseaseService";

// Mock i18n
vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "disease.confidence": "Confidence",
        "disease.treatment": "Treatment",
        "disease.description": "Description",
        "disease.symptoms": "Symptoms",
        "disease.treatmentInstructions": "Treatment Instructions",
        "disease.pesticides": "Recommended Pesticides",
        "disease.organicSolutions": "Organic Solutions",
        "disease.buyNow": "Buy Now",
        "disease.newDetection": "New Detection",
        "disease.saveResult": "Save Result",
        "disease.readAloud": "Read Aloud",
        "disease.warnings.lowConfidence": "Low confidence result. Consider consulting an expert for confirmation.",
      };
      return translations[key] || key;
    },
    lang: "en",
  }),
}));

describe("ResultsDisplay", () => {
  const mockResult: DetectionResult = {
    diseaseName: "Tomato___Late_blight",
    confidence: 87.5,
    treatment: "Remove infected leaves immediately. Apply copper-based fungicide.",
    lowConfidenceWarning: false,
    timestamp: "2024-01-15T10:30:00Z",
  };

  it("renders disease name prominently", () => {
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={mockResult} onNewDetection={onNewDetection} />);

    // Check that disease name is displayed (formatted)
    expect(screen.getByText("Tomato Late Blight")).toBeInTheDocument();
  });

  it("displays confidence score as percentage", () => {
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={mockResult} onNewDetection={onNewDetection} />);

    // Check confidence label and value
    expect(screen.getByText("Confidence")).toBeInTheDocument();
    expect(screen.getByText("87.5%")).toBeInTheDocument();
  });

  it("displays treatment text", () => {
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={mockResult} onNewDetection={onNewDetection} />);

    // Check treatment section
    expect(screen.getByText("Treatment")).toBeInTheDocument();
    expect(screen.getByText(/Remove infected leaves immediately/)).toBeInTheDocument();
  });

  it("shows low confidence warning when confidence < 50%", () => {
    const lowConfidenceResult: DetectionResult = {
      ...mockResult,
      confidence: 45,
      lowConfidenceWarning: true,
    };
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={lowConfidenceResult} onNewDetection={onNewDetection} />);

    // Check for warning message
    expect(screen.getByText(/Low confidence result/)).toBeInTheDocument();
  });

  it("does not show warning when confidence >= 50%", () => {
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={mockResult} onNewDetection={onNewDetection} />);

    // Warning should not be present
    expect(screen.queryByText(/Low confidence result/)).not.toBeInTheDocument();
  });

  it("calls onNewDetection when New Detection button is clicked", () => {
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={mockResult} onNewDetection={onNewDetection} />);

    const newDetectionButton = screen.getByRole("button", { name: /New Detection/i });
    fireEvent.click(newDetectionButton);

    expect(onNewDetection).toHaveBeenCalledTimes(1);
  });

  it("renders Save Result button when onSaveResult is provided", () => {
    const onNewDetection = vi.fn();
    const onSaveResult = vi.fn();
    render(
      <ResultsDisplay
        result={mockResult}
        onNewDetection={onNewDetection}
        onSaveResult={onSaveResult}
      />
    );

    expect(screen.getByRole("button", { name: /Save Result/i })).toBeInTheDocument();
  });

  it("does not render Save Result button when onSaveResult is not provided", () => {
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={mockResult} onNewDetection={onNewDetection} />);

    expect(screen.queryByRole("button", { name: /Save Result/i })).not.toBeInTheDocument();
  });

  it("calls onSaveResult when Save Result button is clicked", () => {
    const onNewDetection = vi.fn();
    const onSaveResult = vi.fn();
    render(
      <ResultsDisplay
        result={mockResult}
        onNewDetection={onNewDetection}
        onSaveResult={onSaveResult}
      />
    );

    const saveButton = screen.getByRole("button", { name: /Save Result/i });
    fireEvent.click(saveButton);

    expect(onSaveResult).toHaveBeenCalledTimes(1);
  });

  it("renders Read Aloud button when onReadAloud is provided", () => {
    const onNewDetection = vi.fn();
    const onReadAloud = vi.fn();
    render(
      <ResultsDisplay
        result={mockResult}
        onNewDetection={onNewDetection}
        onReadAloud={onReadAloud}
      />
    );

    expect(screen.getByRole("button", { name: /Read Aloud/i })).toBeInTheDocument();
  });

  it("does not render Read Aloud button when onReadAloud is not provided", () => {
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={mockResult} onNewDetection={onNewDetection} />);

    expect(screen.queryByRole("button", { name: /Read Aloud/i })).not.toBeInTheDocument();
  });

  it("calls onReadAloud when Read Aloud button is clicked", () => {
    const onNewDetection = vi.fn();
    const onReadAloud = vi.fn();
    render(
      <ResultsDisplay
        result={mockResult}
        onNewDetection={onNewDetection}
        onReadAloud={onReadAloud}
      />
    );

    const readAloudButton = screen.getByRole("button", { name: /Read Aloud/i });
    fireEvent.click(readAloudButton);

    expect(onReadAloud).toHaveBeenCalledTimes(1);
  });

  it("applies correct color coding for high confidence (>80%)", () => {
    const onNewDetection = vi.fn();
    const { container } = render(
      <ResultsDisplay result={mockResult} onNewDetection={onNewDetection} />
    );

    // Check for green color class
    const confidenceText = screen.getByText("87.5%");
    expect(confidenceText).toHaveClass("text-green-600");
  });

  it("applies correct color coding for medium confidence (50-80%)", () => {
    const mediumConfidenceResult: DetectionResult = {
      ...mockResult,
      confidence: 65,
    };
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={mediumConfidenceResult} onNewDetection={onNewDetection} />);

    // Check for yellow color class
    const confidenceText = screen.getByText("65.0%");
    expect(confidenceText).toHaveClass("text-yellow-600");
  });

  it("applies correct color coding for low confidence (<50%)", () => {
    const lowConfidenceResult: DetectionResult = {
      ...mockResult,
      confidence: 30,
      lowConfidenceWarning: true,
    };
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={lowConfidenceResult} onNewDetection={onNewDetection} />);

    // Check for red color class
    const confidenceText = screen.getByText("30.0%");
    expect(confidenceText).toHaveClass("text-red-600");
  });

  it("formats disease name correctly (removes underscores)", () => {
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={mockResult} onNewDetection={onNewDetection} />);

    // Original: "Tomato___Late_blight"
    // Expected: "Tomato Late Blight"
    expect(screen.getByText("Tomato Late Blight")).toBeInTheDocument();
  });

  it("renders all action buttons with proper accessibility", () => {
    const onNewDetection = vi.fn();
    const onSaveResult = vi.fn();
    const onReadAloud = vi.fn();
    render(
      <ResultsDisplay
        result={mockResult}
        onNewDetection={onNewDetection}
        onSaveResult={onSaveResult}
        onReadAloud={onReadAloud}
      />
    );

    // Check all buttons are accessible
    expect(screen.getByRole("button", { name: /New Detection/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save Result/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Read Aloud/i })).toBeInTheDocument();
  });

  it("displays description when provided", () => {
    const resultWithDescription: DetectionResult = {
      ...mockResult,
      description: "A fungal disease affecting tomato plants",
    };
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={resultWithDescription} onNewDetection={onNewDetection} />);

    expect(screen.getByText("A fungal disease affecting tomato plants")).toBeInTheDocument();
  });

  it("displays symptoms list when provided", () => {
    const resultWithSymptoms: DetectionResult = {
      ...mockResult,
      symptoms: ["Dark spots on leaves", "Yellowing of foliage", "Wilting stems"],
    };
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={resultWithSymptoms} onNewDetection={onNewDetection} />);

    expect(screen.getByText("Dark spots on leaves")).toBeInTheDocument();
    expect(screen.getByText("Yellowing of foliage")).toBeInTheDocument();
    expect(screen.getByText("Wilting stems")).toBeInTheDocument();
  });

  it("displays pesticides with buy links when provided", () => {
    const resultWithPesticides: DetectionResult = {
      ...mockResult,
      pesticides: [
        { name: "Copper Fungicide", buyLink: "https://example.com/copper" },
        { name: "Mancozeb", buyLink: "https://example.com/mancozeb" },
      ],
    };
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={resultWithPesticides} onNewDetection={onNewDetection} />);

    expect(screen.getByText("Copper Fungicide")).toBeInTheDocument();
    expect(screen.getByText("Mancozeb")).toBeInTheDocument();
    
    // Check buy links
    const buyLinks = screen.getAllByText(/Buy on Amazon/i);
    expect(buyLinks).toHaveLength(2);
  });

  it("displays organic solutions list when provided", () => {
    const resultWithOrganic: DetectionResult = {
      ...mockResult,
      organicSolutions: ["Neem oil spray", "Baking soda solution", "Compost tea"],
    };
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={resultWithOrganic} onNewDetection={onNewDetection} />);

    expect(screen.getByText("Neem oil spray")).toBeInTheDocument();
    expect(screen.getByText("Baking soda solution")).toBeInTheDocument();
    expect(screen.getByText("Compost tea")).toBeInTheDocument();
  });

  it("does not display enhanced sections when data is not provided", () => {
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={mockResult} onNewDetection={onNewDetection} />);

    // These sections should not be present when data is not provided
    expect(screen.queryByText("Dark spots on leaves")).not.toBeInTheDocument();
    expect(screen.queryByText("Copper Fungicide")).not.toBeInTheDocument();
    expect(screen.queryByText("Neem oil spray")).not.toBeInTheDocument();
  });

  it("displays all enhanced fields together when provided", () => {
    const fullResult: DetectionResult = {
      ...mockResult,
      description: "A fungal disease affecting tomato plants",
      symptoms: ["Dark spots on leaves", "Yellowing of foliage"],
      pesticides: [{ name: "Copper Fungicide", buyLink: "https://example.com/copper" }],
      organicSolutions: ["Neem oil spray", "Baking soda solution"],
    };
    const onNewDetection = vi.fn();
    render(<ResultsDisplay result={fullResult} onNewDetection={onNewDetection} />);

    // Check all sections are present
    expect(screen.getByText("A fungal disease affecting tomato plants")).toBeInTheDocument();
    expect(screen.getByText("Dark spots on leaves")).toBeInTheDocument();
    expect(screen.getByText("Copper Fungicide")).toBeInTheDocument();
    expect(screen.getByText("Neem oil spray")).toBeInTheDocument();
  });
});
