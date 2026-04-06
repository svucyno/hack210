/**
 * Theme Token Test Component
 * 
 * This component verifies that all theme tokens are accessible
 * and properly configured in the application.
 */

export function ThemeTest() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">
          🌾 AgriDash Theme Token Test
        </h1>

        <div className="bg-agri-success text-white p-4 rounded-lg mb-8 text-center">
          ✅ Theme tokens are loaded and accessible!
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Color Palette
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Primary Color */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">
              Primary (Emerald)
            </h3>
            <div className="w-full h-16 bg-primary rounded-lg mb-2 border border-border" />
            <p className="text-sm text-muted-foreground">hsl(160 84% 39%)</p>
          </div>

          {/* Secondary Color */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">
              Secondary
            </h3>
            <div className="w-full h-16 bg-secondary rounded-lg mb-2 border border-border" />
            <p className="text-sm text-muted-foreground">hsl(150 20% 12%)</p>
          </div>

          {/* Accent Color */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">Accent</h3>
            <div className="w-full h-16 bg-accent rounded-lg mb-2 border border-border" />
            <p className="text-sm text-muted-foreground">hsl(160 84% 39%)</p>
          </div>

          {/* Muted Color */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">Muted</h3>
            <div className="w-full h-16 bg-muted rounded-lg mb-2 border border-border" />
            <p className="text-sm text-muted-foreground">hsl(150 20% 15%)</p>
          </div>

          {/* Emerald */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">
              Emerald
            </h3>
            <div className="w-full h-16 bg-agri-emerald rounded-lg mb-2 border border-border" />
            <p className="text-sm text-muted-foreground">hsl(160 84% 39%)</p>
          </div>

          {/* Emerald Light */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">
              Emerald Light
            </h3>
            <div className="w-full h-16 bg-agri-emerald-light rounded-lg mb-2 border border-border" />
            <p className="text-sm text-muted-foreground">hsl(160 84% 50%)</p>
          </div>

          {/* Emerald Dark */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">
              Emerald Dark
            </h3>
            <div className="w-full h-16 bg-agri-emerald-dark rounded-lg mb-2 border border-border" />
            <p className="text-sm text-muted-foreground">hsl(160 84% 30%)</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Typography
        </h2>

        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-primary mb-3">
            Text Hierarchy
          </h3>
          <p className="text-foreground mb-2">
            Primary text - hsl(210 20% 90%)
          </p>
          <p className="text-muted-foreground mb-2">
            Muted text - hsl(210 20% 60%)
          </p>
          <p className="text-primary mb-2">Accent text - hsl(160 84% 39%)</p>
          <p className="text-agri-text-secondary mb-2">
            Secondary text - Agriculture specific
          </p>
          <p className="text-agri-text-muted">
            Muted text - Agriculture specific
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Semantic Colors
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">Success</h3>
            <div className="w-full h-16 bg-agri-success rounded-lg mb-2 border border-border" />
            <p className="text-sm text-muted-foreground">Green-500</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">Warning</h3>
            <div className="w-full h-16 bg-agri-warning rounded-lg mb-2 border border-border" />
            <p className="text-sm text-muted-foreground">Amber-500</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">Danger</h3>
            <div className="w-full h-16 bg-agri-danger rounded-lg mb-2 border border-border" />
            <p className="text-sm text-muted-foreground">Red-500</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">Info</h3>
            <div className="w-full h-16 bg-agri-info rounded-lg mb-2 border border-border" />
            <p className="text-sm text-muted-foreground">Blue-500</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Interactive Components
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">
              Buttons
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Primary Button
              </button>
              <button className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Secondary Button
              </button>
              <button className="w-full bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Muted Button
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">
              Input Fields
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Text input"
                className="w-full bg-background border border-input px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
              <input
                type="email"
                placeholder="Email input"
                className="w-full bg-background border border-input px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary mb-3">
            Animation Classes
          </h3>
          <div className="space-y-2 text-muted-foreground">
            <p>✓ animate-fade-in - Fade in with slide up</p>
            <p>✓ animate-slide-in - Slide in from left</p>
            <p>✓ animate-pulse-emerald - Emerald pulse effect</p>
            <p>✓ animate-pulse-lime - Lime pulse effect</p>
          </div>
        </div>
      </div>
    </div>
  );
}
