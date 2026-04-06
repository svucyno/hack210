import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DiseasePage from "./DiseasePage";

// Mock dependencies
vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    lang: "en" as const,
  }),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/components/LeafDetector", () => ({
  default: () => <div data-testid="leaf-detector">Leaf Detector Component</div>,
}));

vi.mock("@/components/PesticideDetector", () => ({
  default: () => <div data-testid="pesticide-detector">Pesticide Detector Component</div>,
}));

vi.mock("@/components/ResultsDisplay", () => ({
  default: () => <div data-testid="results-display">Results Display Component</div>,
}));

vi.mock("@/components/PesticideResultDisplay", () => ({
  default: () => <div data-testid="pesticide-result-display">Pesticide Result Display Component</div>,
}));

describe("DiseasePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title and tab switcher", () => {
    render(<DiseasePage />);
    
    expect(screen.getByText("Disease Detection & Pesticide Finder")).toBeInTheDocument();
    expect(screen.getByText("🌿 Leaf Detector")).toBeInTheDocument();
    expect(screen.getByText("🧪 Pesticide Detector")).toBeInTheDocument();
  });

  it("renders with correct layout structure", () => {
    const { container } = render(<DiseasePage />);
    
    // Verify main container has correct classes for responsive design
    const mainContainer = container.querySelector(".min-h-\\[calc\\(100vh-8rem\\)\\]");
    expect(mainContainer).toBeInTheDocument();
    
    // Verify max-width for mobile-friendly layout
    const contentContainer = container.querySelector(".max-w-screen-md");
    expect(contentContainer).toBeInTheDocument();
  });

  it("displays page description", () => {
    render(<DiseasePage />);
    
    expect(screen.getByText("AI-powered plant disease detection and pesticide recommendations")).toBeInTheDocument();
  });

  it("renders tab switcher with dark theme styling", () => {
    const { container } = render(<DiseasePage />);
    
    // Verify tab switcher has dark background and emerald border
    const tabSwitcher = container.querySelector(".bg-\\[\\#141e14\\]");
    expect(tabSwitcher).toBeInTheDocument();
    
    // Verify emerald border is present
    const emeraldBorder = container.querySelector(".border-emerald-500\\/10");
    expect(emeraldBorder).toBeInTheDocument();
  });

  it("renders leaf detector by default", () => {
    render(<DiseasePage />);
    
    expect(screen.getByTestId("leaf-detector")).toBeInTheDocument();
  });
});
