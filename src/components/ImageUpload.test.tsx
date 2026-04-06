import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImageUpload from "./ImageUpload";
import * as diseaseService from "@/services/diseaseService";

// Mock the hooks and services
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock("@/services/diseaseService", () => ({
  validateImageFormat: vi.fn(),
}));

describe("ImageUpload Component", () => {
  const mockOnImageSelect = vi.fn();
  let mockObjectURL: string;

  beforeAll(() => {
    // Mock URL.createObjectURL and revokeObjectURL
    mockObjectURL = "blob:mock-url";
    global.URL.createObjectURL = vi.fn(() => mockObjectURL);
    global.URL.revokeObjectURL = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any created object URLs
    mockObjectURL = "blob:mock-url";
  });

  it("renders upload button and upload area", () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    expect(screen.getByText("Upload Image")).toBeInTheDocument();
    expect(screen.getByText("Select or capture an image to begin")).toBeInTheDocument();
  });

  it("accepts valid image file", async () => {
    vi.mocked(diseaseService.validateImageFormat).mockReturnValue({
      isValid: true,
    });

    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    const file = new File(["dummy content"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText("Upload image") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    });
  });

  it("rejects invalid image file and shows error", async () => {
    vi.mocked(diseaseService.validateImageFormat).mockReturnValue({
      isValid: false,
      error: "Invalid file type. Please upload JPEG, PNG, or WebP.",
    });

    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    const file = new File(["dummy content"], "test.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText("Upload image") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Invalid file type. Please upload JPEG, PNG, or WebP.")).toBeInTheDocument();
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    });
  });

  it("displays image preview after selection", async () => {
    vi.mocked(diseaseService.validateImageFormat).mockReturnValue({
      isValid: true,
    });

    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    const file = new File(["dummy content"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText("Upload image") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const img = screen.getByAltText("Selected crop image");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", mockObjectURL);
    });
  });

  it("clears image when clear button is clicked", async () => {
    vi.mocked(diseaseService.validateImageFormat).mockReturnValue({
      isValid: true,
    });

    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    const file = new File(["dummy content"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText("Upload image") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText("Selected crop image")).toBeInTheDocument();
    });

    const clearButton = screen.getByLabelText("Clear image");
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByAltText("Selected crop image")).not.toBeInTheDocument();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectURL);
    });
  });

  it("disables buttons when disabled prop is true", () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} disabled={true} />);

    const uploadButton = screen.getByText("Upload Image");
    expect(uploadButton).toBeDisabled();
  });

  it("shows camera button on mobile devices", async () => {
    // Re-mock the hook to return true for mobile
    const { useIsMobile } = await import("@/hooks/use-mobile");
    vi.mocked(useIsMobile).mockReturnValue(true);

    const { rerender } = render(<ImageUpload onImageSelect={mockOnImageSelect} />);
    
    // Force a re-render to pick up the new mock value
    rerender(<ImageUpload onImageSelect={mockOnImageSelect} />);

    expect(screen.getByText("Capture Photo")).toBeInTheDocument();
    expect(screen.getByText("Upload Image")).toBeInTheDocument();
    
    // Reset mock for other tests
    vi.mocked(useIsMobile).mockReturnValue(false);
  });

  it("uses touch-friendly button sizes (min 44x44px)", () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);

    const uploadButton = screen.getByText("Upload Image");
    expect(uploadButton).toHaveClass("min-h-[44px]");
  });
});
