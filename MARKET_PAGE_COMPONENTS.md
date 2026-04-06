# Market Page Components Guide

## 📦 New Components Added

### Location: `src/components/market/`

---

## 1️⃣ MarketPriceCard.tsx
**Purpose**: Display individual market price information

**Props**:
- `marketName`: string - Name of the market
- `district`: string - District location
- `price`: number - Current price
- `change`: number - Percentage change
- `isHighest`: boolean - Highlight as best price
- `isLowest`: boolean - Highlight as worst price
- `index`: number - For staggered animation

**Features**:
- Glassmorphism card design
- Green glow for highest price
- Red glow for lowest price
- Hover animations
- Responsive layout

---

## 2️⃣ ProfitCalculator.tsx
**Purpose**: Calculate net profit after transport costs

**Props**:
- `basePrice`: number - Base market price

**Features**:
- Input field for transport cost
- Real-time calculation
- Animated result display
- Neon green accent
- Glassmorphism design

**User Flow**:
1. User enters transport cost
2. Clicks "Calculate Profit"
3. See net profit displayed

---

## 3️⃣ DemandIndicator.tsx
**Purpose**: Visual representation of market demand

**Props**:
- `level`: "high" | "medium" | "low"
- `cropName`: string

**Features**:
- Color-coded badges
- Animated bar chart (1-3 bars)
- High = Green, Medium = Yellow, Low = Gray
- Compact card design

---

## 4️⃣ AISuggestionCard.tsx
**Purpose**: Display AI-powered market recommendations

**Props**:
- `suggestion`: object with:
  - `title`: string
  - `description`: string
  - `market`: string
  - `expectedProfit`: string

**Features**:
- Purple-green gradient
- Animated background
- Expected profit display
- Market location info
- Glassmorphism effect

---

## 5️⃣ ChatbotButton.tsx
**Purpose**: Floating action button for chatbot access

**Props**: None

**Features**:
- Fixed position (bottom-right)
- Pulse animation
- Notification dot
- Neon green glow
- Hover scale effect

---

## 6️⃣ PriceTrendChart.tsx
**Purpose**: Display 30-day price trend

**Props**:
- `data`: Array<{ day: number, price: number }>
- `cropName`: string
- `currentPrice`: string
- `change`: string

**Features**:
- Area chart with gradient
- Interactive tooltips
- Min/Avg/Max statistics
- Glassmorphism card
- Responsive design

---

## 🎨 Design System

### Colors
```css
Background: #0B0F0C (dark green-black)
Neon Green: #A3FF12
Secondary Green: #8FE610
Red Accent: #EF4444
Purple Accent: #A855F7
White/Gray: #FFFFFF / #6B7280
```

### Effects
- **Glassmorphism**: `backdrop-blur-xl` + `bg-[color]/opacity`
- **Glow**: `shadow-[0_0_30px_rgba(163,255,18,0.4)]`
- **Hover**: `hover:scale-[1.02]` + `transition-all duration-300`
- **Animations**: Framer Motion with staggered delays

### Spacing
- Cards: `p-4` to `p-6`
- Gaps: `gap-4` to `gap-6`
- Margins: `mb-4` to `mb-8`
- Rounded: `rounded-2xl`

---

## 🔧 Usage Example

```tsx
import MarketPriceCard from "@/components/market/MarketPriceCard";

<MarketPriceCard
  marketName="Guntur Market"
  district="Guntur"
  price={7250}
  change={12}
  isHighest={true}
  isLowest={false}
  index={0}
/>
```

---

## 📱 Responsive Breakpoints

- **Mobile**: Single column, stacked layout
- **Tablet** (md): 2 columns for cards
- **Desktop** (lg): 3-4 columns for cards

---

## ✨ Animation Delays

Components animate in sequence:
- Header: 0ms
- State Selector: 100ms
- Crop Tabs: 150ms
- Best/Worst: 200ms
- Market Cards: 250ms + (index * 50ms)
- Chart: 150ms
- Calculator: 200ms
- Demand: 250ms
- Transport: 300ms
- AI Suggestion: 300ms
- Chatbot: 500ms

---

## 🚀 Integration Points

All components are **UI-only** and ready for:
- Real API data integration
- State management (Redux/Zustand)
- Backend connections
- Real-time updates
- User authentication

---

## 📝 Notes

- All components use TypeScript
- Fully typed props
- Accessible (ARIA labels where needed)
- Mobile-first responsive
- Dark theme optimized
- Performance optimized (React.memo ready)
