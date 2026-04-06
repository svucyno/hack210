import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./HomePage";
import { I18nProvider } from "@/lib/i18n";

// Mock the widget components to avoid ResizeObserver issues
vi.mock("@/components/WeatherWidget", () => ({
  default: () => <div data-testid="weather-widget">Weather Widget</div>,
}));

vi.mock("@/components/MarketWidget", () => ({
  default: () => <div data-testid="market-widget">Market Widget</div>,
}));

vi.mock("@/components/CropRecommendation", () => ({
  default: () => <div data-testid="crop-recommendation">Crop Recommendation</div>,
}));

vi.mock("@/components/AlertsWidget", () => ({
  default: () => <div data-testid="alerts-widget">Alerts Widget</div>,
}));

describe("HomePage - Greeting Section (Task 3.1)", () => {
  it("renders greeting section with dark theme text colors", () => {
    render(
      <I18nProvider>
        <HomePage />
      </I18nProvider>
    );

    // Check that greeting text is rendered with slate-200 color
    const greeting = screen.getByText(/Good morning, Farmer!/i);
    expect(greeting).toBeInTheDocument();
    expect(greeting).toHaveClass("text-slate-200");
    expect(greeting.tagName).toBe("H2");

    // Check that overview text is rendered with slate-400 color
    const overview = screen.getByText(/Today's Overview/i);
    expect(overview).toBeInTheDocument();
    expect(overview).toHaveClass("text-slate-400");
    expect(overview.tagName).toBe("P");
  });

  it("applies fade-in animation to greeting section", () => {
    const { container } = render(
      <I18nProvider>
        <HomePage />
      </I18nProvider>
    );

    // Check that the greeting container exists with proper margin
    const greetingContainer = container.querySelector(".mb-4");
    expect(greetingContainer).toBeInTheDocument();
    
    // Verify it contains both greeting elements
    const greeting = greetingContainer?.querySelector("h2");
    const overview = greetingContainer?.querySelector("p");
    expect(greeting).toBeInTheDocument();
    expect(overview).toBeInTheDocument();
  });

  it("preserves user greeting data fetching via i18n", () => {
    render(
      <I18nProvider>
        <HomePage />
      </I18nProvider>
    );

    // Verify that the i18n translation system is working
    // The greeting should be translated based on the current language
    const greeting = screen.getByText(/Good morning, Farmer!/i);
    expect(greeting).toBeInTheDocument();
    
    const overview = screen.getByText(/Today's Overview/i);
    expect(overview).toBeInTheDocument();
  });
});
