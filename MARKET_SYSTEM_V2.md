# Smart Agriculture Market Dashboard - V2

## 🎯 Overview
Complete redesign of the Market Page with **dynamic crop loading**, **state-based filtering**, and **scalable architecture** ready for real backend integration.

---

## ✅ What Changed

### ❌ OLD SYSTEM (Hardcoded)
- Only 3-4 crops (Cotton, Wheat, Paddy)
- Fake random data
- No state-crop relationship
- Not scalable

### ✅ NEW SYSTEM (Dynamic & Scalable)
- **30+ crops** across multiple categories
- **State-based crop filtering** (realistic distribution)
- **AGMARKNET-format data structure**
- **Supabase-ready** with fallback to mock data
- **Clean feature-based architecture**

---

## 📁 New File Structure

```
src/features/market/
├── MarketPage.tsx              # Main page component
├── types.ts                    # TypeScript interfaces
├── mockData.ts                 # Realistic mock data (AGMARKNET format)
├── marketService.ts            # Data service (Supabase + mock)
└── components/
    ├── CropSelector.tsx        # Scrollable crop chips with search
    ├── MarketList.tsx          # Market cards grid
    └── BestWorstCard.tsx       # Best/Worst price highlights

src/pages/
└── MarketPage.tsx              # Re-exports feature component

src/components/market/          # Reused components
├── MarketPriceCard.tsx
├── ProfitCalculator.tsx
├── DemandIndicator.tsx
├── AISuggestionCard.tsx
├── ChatbotButton.tsx
└── PriceTrendChart.tsx
```

---

## 🌾 Crop Database

### Total Crops: 33

**Categories:**
1. **Cereals** (5): Paddy, Wheat, Maize, Jowar, Bajra
2. **Pulses** (4): Red Gram, Green Gram, Black Gram, Bengal Gram
3. **Vegetables** (8): Tomato, Onion, Potato, Brinjal, Cabbage, Cauliflower, Carrot, Beans
4. **Fruits** (4): Mango, Banana, Papaya, Guava
5. **Spices** (4): Chilli, Turmeric, Coriander, Cumin
6. **Cash Crops** (3): Cotton, Sugarcane, Tobacco
7. **Oilseeds** (4): Groundnut, Sunflower, Sesame, Castor

### Multi-language Support
- English, Hindi (हिंदी), Telugu (తెలుగు)

---

## 🗺️ State-Crop Mapping

### Andhra Pradesh (14 crops)
Paddy, Cotton, Chilli, Turmeric, Groundnut, Maize, Red Gram, Tomato, Onion, Mango, Banana, Tobacco, Sunflower, Castor

### Telangana (12 crops)
Paddy, Cotton, Maize, Red Gram, Jowar, Turmeric, Chilli, Tomato, Onion, Mango, Groundnut, Sunflower

### Karnataka (14 crops)
Paddy, Maize, Jowar, Cotton, Sugarcane, Groundnut, Sunflower, Tomato, Onion, Potato, Mango, Banana, Coffee, Cardamom

### Tamil Nadu (12 crops)
Paddy, Sugarcane, Cotton, Groundnut, Maize, Banana, Mango, Tomato, Onion, Turmeric, Coconut, Tapioca

### Maharashtra, Punjab, Haryana, UP
(Also configured with realistic crop distributions)

---

## 📊 Data Structure (AGMARKNET Format)

```typescript
interface MarketRecord {
  id: string;
  state: string;
  district: string;
  market: string;
  commodity: string;          // Crop name
  variety?: string;
  grade?: string;
  arrival_date: string;       // ISO date
  min_price: number;
  max_price: number;
  modal_price: number;        // Most common price
  price_unit: string;         // "Quintal"
}
```

---

## 🔄 User Flow

1. **Select State** → Dropdown (8 states)
2. **Load Crops** → Dynamic fetch based on state
3. **Browse Crops** → Scrollable chips grouped by category
4. **Search Crops** → Real-time filter
5. **Select Crop** → Auto-load market data
6. **View Markets** → Best/Worst + All markets grid
7. **Analyze Trends** → 30-day price chart
8. **Calculate Profit** → Interactive calculator
9. **Check Demand** → High/Medium/Low indicator
10. **Get AI Suggestions** → Smart recommendations

---

## 🎨 UI Features

### Crop Selector
- **Scrollable horizontal chips** (not limited to 3-4)
- **Search bar** with real-time filtering
- **Category grouping** (Cereals, Vegetables, etc.)
- **Multi-language** labels
- **Smooth animations**

### Market Display
- **Best/Worst highlights** (green/red glow)
- **Dynamic grid** (4+ markets per crop)
- **Real-time updates**
- **Loading states**

### Charts & Analytics
- **30-day price trends** (realistic progression)
- **Min/Avg/Max statistics**
- **Interactive tooltips**
- **Demand indicators**

---

## 🔌 Backend Integration

### Current Status
- ✅ Supabase client configured
- ✅ Service layer ready
- ⏳ Waiting for `market_data` table

### When Supabase Table is Ready

The system will **automatically switch** from mock data to real data.

**No code changes needed!**

The `marketService.ts` checks for table existence:
```typescript
async function checkSupabaseTable(): Promise<boolean> {
  const { error } = await supabase.from("market_data").select("id").limit(1);
  return !error;
}
```

### Required Supabase Table Schema

```sql
CREATE TABLE market_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  market TEXT NOT NULL,
  commodity TEXT NOT NULL,
  variety TEXT,
  grade TEXT,
  arrival_date DATE NOT NULL,
  min_price NUMERIC NOT NULL,
  max_price NUMERIC NOT NULL,
  modal_price NUMERIC NOT NULL,
  price_unit TEXT DEFAULT 'Quintal',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_market_state_commodity ON market_data(state, commodity);
CREATE INDEX idx_market_date ON market_data(arrival_date DESC);
```

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
cd agridash-your-farming-partner
npm install
# or
bun install
```

### 2. Start Development Server
```bash
npm run dev
# or
bun run dev
```

### 3. Open Browser
```
http://localhost:5173
```

---

## 📝 Mock Data Details

### Realistic Pricing (₹/Quintal)
- Paddy: ~₹2,200
- Wheat: ~₹2,500
- Cotton: ~₹7,000
- Chilli: ~₹12,000
- Tomato: ~₹1,500
- Onion: ~₹1,200

### Price Variation
- ±15% variation across markets
- Min/Max spread: ~8%
- Realistic daily trends (not random)

### Historical Data
- 30-day trends with realistic progression
- Seasonal patterns simulated
- Market-specific variations

---

## 🎯 Key Improvements

### 1. Dynamic Crop Loading ✅
- State → Crops relationship
- No hardcoded limits
- Scalable to 100+ crops

### 2. Realistic Data Structure ✅
- AGMARKNET format
- Proper date handling
- Multi-market support

### 3. Clean Architecture ✅
- Feature-based organization
- Separation of concerns
- Reusable components

### 4. Backend Ready ✅
- Supabase integration layer
- Automatic fallback to mock
- Easy migration path

### 5. Better UX ✅
- Scrollable crop selector
- Search functionality
- Category grouping
- Loading states

---

## 🔧 Customization

### Add New Crops
Edit `src/features/market/mockData.ts`:
```typescript
export const ALL_CROPS: CropInfo[] = [
  // Add your crop here
  { 
    name: "Soybean", 
    nameHi: "सोयाबीन", 
    nameTe: "సోయాబీన్", 
    category: "Oilseeds" 
  },
];
```

### Add New States
```typescript
const STATE_CROP_MAP: Record<string, string[]> = {
  "New State": ["Crop1", "Crop2", "Crop3"],
};
```

### Adjust Prices
```typescript
const basePrices: Record<string, number> = {
  "YourCrop": 5000, // ₹/Quintal
};
```

---

## 🐛 Troubleshooting

### Crops not loading?
- Check browser console for errors
- Verify state selection
- Check `mockData.ts` for state-crop mapping

### Markets not showing?
- Ensure crop is selected
- Check `marketService.ts` for data fetch
- Verify mock data generation

### Supabase not connecting?
- Check `.env` file for correct credentials
- Verify Supabase project is active
- Check network tab for API calls

---

## 📈 Future Enhancements

### Phase 1 (Current) ✅
- Dynamic crop loading
- State-based filtering
- Mock data with realistic structure

### Phase 2 (Next)
- Real Supabase integration
- Live price updates
- Historical data storage

### Phase 3 (Future)
- Price prediction ML model
- Weather integration
- Market alerts & notifications
- Export data (CSV/PDF)

---

## 🎉 Summary

### What You Get
- ✅ 33 crops across 8 states
- ✅ Dynamic state-crop filtering
- ✅ Scrollable crop selector with search
- ✅ Realistic AGMARKNET-format data
- ✅ 30-day price trends
- ✅ Best/Worst market highlights
- ✅ Profit calculator
- ✅ Demand indicators
- ✅ AI suggestions
- ✅ Supabase-ready architecture
- ✅ Clean, maintainable code
- ✅ Mobile responsive
- ✅ Multi-language support

### What Didn't Change
- ✅ Supabase configuration
- ✅ API keys
- ✅ Environment variables
- ✅ Other pages
- ✅ Routing
- ✅ Authentication

---

**Built with ❤️ for Smart Agriculture**
