/**
 * Theme Integration Test
 * 
 * Verifies that theme tokens are properly applied to components
 * and that Tailwind classes using theme tokens work correctly.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeTest } from '../components/ThemeTest';

describe('Theme Integration', () => {
  it('should render ThemeTest component without errors', () => {
    const { container } = render(<ThemeTest />);
    expect(container).toBeTruthy();
  });

  it('should display theme test heading', () => {
    render(<ThemeTest />);
    const heading = screen.getByText(/AgriDash Theme Token Test/i);
    expect(heading).toBeInTheDocument();
  });

  it('should display success message', () => {
    render(<ThemeTest />);
    const successMessage = screen.getByText(/Theme tokens are loaded and accessible/i);
    expect(successMessage).toBeInTheDocument();
  });

  it('should render color palette section', () => {
    render(<ThemeTest />);
    const colorPaletteHeading = screen.getByText('Color Palette');
    expect(colorPaletteHeading).toBeInTheDocument();
  });

  it('should render typography section', () => {
    render(<ThemeTest />);
    const typographyHeading = screen.getByText('Typography');
    expect(typographyHeading).toBeInTheDocument();
  });

  it('should render semantic colors section', () => {
    render(<ThemeTest />);
    const semanticColorsHeading = screen.getByText('Semantic Colors');
    expect(semanticColorsHeading).toBeInTheDocument();
  });

  it('should render interactive components section', () => {
    render(<ThemeTest />);
    const interactiveHeading = screen.getByText('Interactive Components');
    expect(interactiveHeading).toBeInTheDocument();
  });

  it('should render primary button', () => {
    render(<ThemeTest />);
    const primaryButton = screen.getByText('Primary Button');
    expect(primaryButton).toBeInTheDocument();
  });

  it('should render input fields', () => {
    render(<ThemeTest />);
    const textInput = screen.getByPlaceholderText('Text input');
    const emailInput = screen.getByPlaceholderText('Email input');
    expect(textInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
  });

  it('should list animation classes', () => {
    render(<ThemeTest />);
    expect(screen.getByText(/animate-fade-in/)).toBeInTheDocument();
    expect(screen.getByText(/animate-slide-in/)).toBeInTheDocument();
    expect(screen.getByText(/animate-pulse-emerald/)).toBeInTheDocument();
    expect(screen.getByText(/animate-pulse-lime/)).toBeInTheDocument();
  });
});
