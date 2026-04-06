import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BottomNav from './BottomNav';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, layoutId, transition, ...props }: any) => (
      <div className={className} data-layout-id={layoutId} {...props}>{children}</div>
    ),
  },
}));

// Mock i18n
vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('BottomNav', () => {
  const renderBottomNav = () => {
    return render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    );
  };

  it('renders all navigation items', () => {
    renderBottomNav();
    
    // Check that all nav items are present
    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('market')).toBeInTheDocument();
    expect(screen.getByText('disease')).toBeInTheDocument();
    expect(screen.getByText('cropAdvisor')).toBeInTheDocument();
    expect(screen.getByText('assistant')).toBeInTheDocument();
    expect(screen.getByText('schemes')).toBeInTheDocument();
    expect(screen.getByText('profile')).toBeInTheDocument();
  });

  it('applies dark theme styling with blur effect', () => {
    const { container } = renderBottomNav();
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('bg-black/80');
    expect(nav).toHaveClass('backdrop-blur-xl');
  });

  it('applies emerald border styling', () => {
    const { container } = renderBottomNav();
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('border-emerald-500/10');
  });

  it('renders with fixed positioning at bottom', () => {
    const { container } = renderBottomNav();
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('bottom-0');
  });

  it('renders active indicator with emerald styling', () => {
    const { container } = renderBottomNav();
    
    // The active indicator should be present for the home route (default)
    const activeIndicator = container.querySelector('[data-layout-id="nav-indicator"]');
    expect(activeIndicator).toBeInTheDocument();
    expect(activeIndicator).toHaveClass('bg-emerald-500');
  });

  it('applies emerald color to active navigation items', () => {
    const { container } = renderBottomNav();
    
    // Find the home button (should be active on default route)
    const buttons = container.querySelectorAll('button');
    const homeButton = buttons[0]; // First button is home
    
    // Check icon has emerald color
    const icon = homeButton.querySelector('svg');
    expect(icon).toHaveClass('text-emerald-500');
    
    // Check label has emerald color
    const label = homeButton.querySelector('span');
    expect(label).toHaveClass('text-emerald-500');
  });

  it('applies muted color to inactive navigation items', () => {
    const { container } = renderBottomNav();
    
    // Find a non-active button (market button)
    const buttons = container.querySelectorAll('button');
    const marketButton = buttons[1]; // Second button is market
    
    // Check icon has muted color
    const icon = marketButton.querySelector('svg');
    expect(icon).toHaveClass('text-slate-400');
    
    // Check label has muted color
    const label = marketButton.querySelector('span');
    expect(label).toHaveClass('text-slate-400');
  });
});
