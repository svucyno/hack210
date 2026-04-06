import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AppHeader from "./AppHeader";

// Mock the i18n hook
vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    lang: "en",
    setLang: vi.fn(),
    t: (key: string) => {
      const translations: Record<string, string> = {
        appName: "AgriDash",
      };
      return translations[key] || key;
    },
  }),
  languageLabels: {
    en: "English",
    hi: "हिंदी",
    te: "తెలుగు",
  },
}));

describe("AppHeader", () => {
  it("renders the app name", () => {
    render(<AppHeader />);
    expect(screen.getByText("AgriDash")).toBeInTheDocument();
  });

  it("renders the language switcher button", () => {
    render(<AppHeader />);
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("applies dark theme styling", () => {
    const { container } = render(<AppHeader />);
    const header = container.querySelector("header");
    expect(header).toHaveClass("bg-black/80");
    expect(header).toHaveClass("backdrop-blur-xl");
    expect(header).toHaveClass("border-b");
    expect(header).toHaveClass("border-emerald-500/10");
  });

  it("applies emerald gradient to logo container", () => {
    const { container } = render(<AppHeader />);
    const logoContainer = container.querySelector(".bg-gradient-to-br");
    expect(logoContainer).toHaveClass("from-emerald-500");
    expect(logoContainer).toHaveClass("to-emerald-600");
  });

  it("language switcher has emerald hover styles", () => {
    const { container } = render(<AppHeader />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("hover:bg-emerald-500/10");
    expect(button).toHaveClass("hover:text-emerald-400");
    expect(button).toHaveClass("hover:border-emerald-500/30");
  });

  it("language switcher is clickable", () => {
    render(<AppHeader />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    // The button should be clickable without errors
    expect(button).toBeInTheDocument();
  });
});
