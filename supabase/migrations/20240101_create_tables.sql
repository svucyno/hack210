-- Market Prices Table
CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  location TEXT NOT NULL,
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')) DEFAULT 'stable',
  change_percentage DECIMAL(5, 2) DEFAULT 0,
  unit TEXT DEFAULT 'per quintal',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Government Schemes Table
CREATE TABLE IF NOT EXISTS government_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  deadline TEXT NOT NULL,
  category TEXT NOT NULL,
  benefits TEXT NOT NULL,
  apply_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  location TEXT,
  language TEXT DEFAULT 'en',
  soil_type TEXT,
  farm_size DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON market_prices(crop_name);
CREATE INDEX IF NOT EXISTS idx_market_prices_location ON market_prices(location);
CREATE INDEX IF NOT EXISTS idx_market_prices_updated ON market_prices(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON government_schemes(category);
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Market prices: Public read access
CREATE POLICY "Market prices are viewable by everyone"
  ON market_prices FOR SELECT
  USING (true);

-- Government schemes: Public read access
CREATE POLICY "Government schemes are viewable by everyone"
  ON government_schemes FOR SELECT
  USING (true);

-- User profiles: Users can read and update their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Chat history: Users can only access their own chat history
CREATE POLICY "Users can view their own chat history"
  ON chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert sample data
INSERT INTO market_prices (crop_name, price, location, trend, change_percentage) VALUES
  ('Rice', 2500, 'Hyderabad', 'up', 5.2),
  ('Wheat', 2200, 'Hyderabad', 'down', -2.1),
  ('Cotton', 5800, 'Hyderabad', 'up', 8.7),
  ('Tomato', 1850, 'Hyderabad', 'up', 12.3),
  ('Onion', 2400, 'Hyderabad', 'stable', 0.5),
  ('Sugarcane', 3200, 'Hyderabad', 'up', 3.8)
ON CONFLICT DO NOTHING;

INSERT INTO government_schemes (name, description, eligibility, deadline, category, benefits, apply_url) VALUES
  ('PM-KISAN', 'Direct income support of ₹6000/year to all farmer families', 'All landholding farmer families', 'Ongoing', 'Financial Support', '₹2000 per installment, 3 times a year', 'https://pmkisan.gov.in/'),
  ('Pradhan Mantri Fasal Bima Yojana', 'Crop insurance scheme for farmers', 'All farmers growing notified crops', 'Before sowing season', 'Insurance', 'Coverage against crop loss due to natural calamities', 'https://pmfby.gov.in/'),
  ('Soil Health Card Scheme', 'Free soil testing and recommendations', 'All farmers', 'Ongoing', 'Advisory', 'Free soil testing and nutrient management advice', NULL),
  ('Kisan Credit Card', 'Credit facility for farmers', 'Farmers with land ownership', 'Ongoing', 'Credit', 'Low-interest loans up to ₹3 lakhs', 'https://www.india.gov.in/'),
  ('PM Kusum Yojana', 'Solar pump subsidy for farmers', 'Individual farmers and farmer groups', 'Check state portal', 'Subsidy', '60% subsidy on solar pumps', NULL)
ON CONFLICT DO NOTHING;
