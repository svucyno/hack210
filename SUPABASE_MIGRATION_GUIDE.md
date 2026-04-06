# Supabase Migration Guide - Market Data

## 📋 Overview
This guide helps you migrate from mock data to real Supabase backend for the Market Page.

---

## 🗄️ Step 1: Create Supabase Table

### SQL Schema

Run this in your Supabase SQL Editor:

```sql
-- Create market_data table
CREATE TABLE IF NOT EXISTS public.market_data (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_state_commodity 
  ON public.market_data(state, commodity);

CREATE INDEX IF NOT EXISTS idx_market_date 
  ON public.market_data(arrival_date DESC);

CREATE INDEX IF NOT EXISTS idx_market_created 
  ON public.market_data(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" 
  ON public.market_data 
  FOR SELECT 
  USING (true);

-- Create policy for authenticated insert (optional)
CREATE POLICY "Allow authenticated insert" 
  ON public.market_data 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Create policy for authenticated update (optional)
CREATE POLICY "Allow authenticated update" 
  ON public.market_data 
  FOR UPDATE 
  TO authenticated 
  USING (true);
```

---

## 📊 Step 2: Insert Sample Data

### Option A: Manual Insert (Small Dataset)

```sql
INSERT INTO public.market_data 
  (state, district, market, commodity, arrival_date, min_price, max_price, modal_price)
VALUES
  ('Andhra Pradesh', 'Guntur', 'Guntur Market', 'Cotton', '2025-01-15', 6800, 7500, 7250),
  ('Andhra Pradesh', 'Krishna', 'Krishna Market', 'Paddy', '2025-01-15', 2200, 2500, 2350),
  ('Telangana', 'Warangal', 'Warangal Market', 'Cotton', '2025-01-15', 6700, 7300, 7100),
  ('Telangana', 'Nizamabad', 'Nizamabad Market', 'Wheat', '2025-01-15', 2500, 2800, 2640);
```

### Option B: Bulk Import (Large Dataset)

1. Export mock data to CSV:
```typescript
// Run this in browser console on Market Page
import { generateHistoricalData } from '@/features/market/mockData';

const data = generateHistoricalData('Andhra Pradesh', 'Cotton', 30);
console.table(data);
// Copy and save as CSV
```

2. Import CSV in Supabase Dashboard:
   - Go to Table Editor
   - Select `market_data` table
   - Click "Insert" → "Import data from CSV"

---

## 🔄 Step 3: Update TypeScript Types (Optional)

If your Supabase table structure differs, update:

`src/integrations/supabase/types.ts`

```typescript
export type Database = {
  public: {
    Tables: {
      market_data: {
        Row: {
          id: string;
          state: string;
          district: string;
          market: string;
          commodity: string;
          variety: string | null;
          grade: string | null;
          arrival_date: string;
          min_price: number;
          max_price: number;
          modal_price: number;
          price_unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          state: string;
          district: string;
          market: string;
          commodity: string;
          variety?: string | null;
          grade?: string | null;
          arrival_date: string;
          min_price: number;
          max_price: number;
          modal_price: number;
          price_unit?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          state?: string;
          district?: string;
          market?: string;
          commodity?: string;
          variety?: string | null;
          grade?: string | null;
          arrival_date?: string;
          min_price?: number;
          max_price?: number;
          modal_price?: number;
          price_unit?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // ... other tables
    };
  };
};
```

---

## ✅ Step 4: Test the Integration

### Automatic Detection

The system will automatically detect the Supabase table and switch from mock data.

### Manual Test

1. Open browser console
2. Navigate to Market Page
3. Check network tab for Supabase API calls
4. Look for: `https://[your-project].supabase.co/rest/v1/market_data`

### Verify Data Flow

```typescript
// In browser console
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('market_data')
  .select('*')
  .limit(5);

console.log('Supabase data:', data);
console.log('Error:', error);
```

---

## 🔧 Step 5: Populate with Real Data

### Option 1: AGMARKNET API Integration

Create a data sync service:

```typescript
// src/services/agmarknetSync.ts

export async function syncAGMARKNETData() {
  // Fetch from AGMARKNET API
  const response = await fetch('https://api.data.gov.in/resource/...');
  const data = await response.json();

  // Transform and insert into Supabase
  const { error } = await supabase
    .from('market_data')
    .insert(transformedData);

  return { success: !error, error };
}
```

### Option 2: Scheduled Cron Job

Use Supabase Edge Functions:

```typescript
// supabase/functions/sync-market-data/index.ts

Deno.serve(async (req) => {
  // Fetch latest market data
  // Insert into market_data table
  // Return success/failure
});
```

Schedule in Supabase Dashboard:
- Go to Edge Functions
- Deploy `sync-market-data`
- Set cron: `0 0 * * *` (daily at midnight)

---

## 📈 Step 6: Optimize Performance

### Add More Indexes

```sql
-- For crop-specific queries
CREATE INDEX idx_market_commodity 
  ON public.market_data(commodity);

-- For date range queries
CREATE INDEX idx_market_date_range 
  ON public.market_data(arrival_date, commodity);

-- For state-district queries
CREATE INDEX idx_market_location 
  ON public.market_data(state, district);
```

### Enable Caching

Update `marketService.ts`:

```typescript
// Add caching layer
const cache = new Map();

export async function fetchMarketData(state: string, commodity: string) {
  const cacheKey = `${state}-${commodity}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const data = await supabase
    .from('market_data')
    .select('*')
    .eq('state', state)
    .eq('commodity', commodity);

  cache.set(cacheKey, data);
  return data;
}
```

---

## 🚨 Troubleshooting

### Issue: "relation 'market_data' does not exist"
**Solution:** Run the CREATE TABLE SQL in Step 1

### Issue: "permission denied for table market_data"
**Solution:** Check RLS policies in Step 1

### Issue: "No data showing in UI"
**Solution:** 
1. Check if table has data: `SELECT COUNT(*) FROM market_data;`
2. Verify RLS policies allow SELECT
3. Check browser console for errors

### Issue: "Still showing mock data"
**Solution:**
1. Clear browser cache
2. Check `checkSupabaseTable()` function
3. Verify Supabase credentials in `.env`

---

## 📊 Data Quality Checklist

Before going live, ensure:

- [ ] All states have data
- [ ] All major crops covered
- [ ] Prices are realistic (₹/Quintal)
- [ ] Dates are current (last 30 days)
- [ ] No duplicate records
- [ ] Min ≤ Modal ≤ Max prices
- [ ] District names are correct
- [ ] Market names are consistent

---

## 🔄 Rollback Plan

If issues occur, the system automatically falls back to mock data.

To force mock data:

```typescript
// In marketService.ts
async function checkSupabaseTable(): Promise<boolean> {
  return false; // Force mock data
}
```

---

## 📝 Maintenance

### Daily Tasks
- Monitor data freshness
- Check for API errors
- Verify price accuracy

### Weekly Tasks
- Clean old data (>90 days)
- Update crop availability
- Review demand indicators

### Monthly Tasks
- Analyze price trends
- Update base prices
- Optimize queries

---

## 🎯 Success Metrics

After migration, you should see:

- ✅ Real-time market prices
- ✅ Accurate historical trends
- ✅ Fast query performance (<500ms)
- ✅ No mock data fallbacks
- ✅ Consistent data updates

---

## 📞 Support

If you need help:

1. Check Supabase logs
2. Review browser console
3. Test API endpoints manually
4. Check RLS policies

---

**Ready to go live! 🚀**
