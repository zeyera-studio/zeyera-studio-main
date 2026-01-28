-- ============================================
-- PAYMENT & PURCHASES SYSTEM - DATABASE SETUP
-- ============================================

-- 1. ADD PRICE COLUMN TO CONTENT TABLE
-- ============================================
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;

-- 2. CREATE SEASON_PRICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.season_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(content_id, season_number)
);

-- 3. CREATE PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  season_number INTEGER, -- NULL for movies, specific season for TV series
  order_id TEXT UNIQUE NOT NULL, -- PayHere order_id
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'LKR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT, -- 'payhere', 'manual', etc.
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, content_id, season_number)
);

-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_season_prices_content ON public.season_prices(content_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_content ON public.purchases(content_id);
CREATE INDEX IF NOT EXISTS idx_purchases_order ON public.purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);

-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.season_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR SEASON_PRICES
-- ============================================
DROP POLICY IF EXISTS "Anyone can view season prices" ON public.season_prices;
DROP POLICY IF EXISTS "Admins can manage season prices" ON public.season_prices;

CREATE POLICY "Anyone can view season prices"
  ON public.season_prices FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert season prices"
  ON public.season_prices FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update season prices"
  ON public.season_prices FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete season prices"
  ON public.season_prices FOR DELETE
  USING (public.is_admin());

-- 7. RLS POLICIES FOR PURCHASES
-- ============================================
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can update own pending purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can manage purchases" ON public.purchases;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own purchases (pending)
CREATE POLICY "Users can insert own purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending purchases (for completing payment)
CREATE POLICY "Users can update own pending purchases"
  ON public.purchases FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
  ON public.purchases FOR SELECT
  USING (public.is_admin());

-- Admins can manage all purchases
CREATE POLICY "Admins can update all purchases"
  ON public.purchases FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete purchases"
  ON public.purchases FOR DELETE
  USING (public.is_admin());

-- 8. AUTO-UPDATE TIMESTAMP TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_season_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_season_prices_updated_at ON public.season_prices;
CREATE TRIGGER trigger_update_season_prices_updated_at
  BEFORE UPDATE ON public.season_prices
  FOR EACH ROW EXECUTE FUNCTION update_season_prices_updated_at();

-- 9. HELPER FUNCTION: Check if user has purchased content
-- ============================================
CREATE OR REPLACE FUNCTION public.has_purchased(
  p_user_id UUID,
  p_content_id UUID,
  p_season_number INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_season_number IS NULL THEN
    -- Movie purchase check
    RETURN EXISTS (
      SELECT 1 FROM public.purchases
      WHERE user_id = p_user_id
        AND content_id = p_content_id
        AND season_number IS NULL
        AND status = 'completed'
    );
  ELSE
    -- TV Series season purchase check
    RETURN EXISTS (
      SELECT 1 FROM public.purchases
      WHERE user_id = p_user_id
        AND content_id = p_content_id
        AND season_number = p_season_number
        AND status = 'completed'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. VERIFICATION QUERY
-- ============================================
SELECT 'season_prices table' as item,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'season_prices')
    THEN '✓ Created' ELSE '✗ Failed' END as status
UNION ALL
SELECT 'purchases table',
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'purchases')
    THEN '✓ Created' ELSE '✗ Failed' END
UNION ALL
SELECT 'content.price column',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'content' AND column_name = 'price'
  ) THEN '✓ Added' ELSE '✗ Failed' END;
