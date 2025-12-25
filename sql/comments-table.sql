-- ============================================
-- COMMENTS SYSTEM - DATABASE SETUP
-- ============================================

-- 1. CREATE COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_comments_content ON public.comments(content_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);

-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES FOR COMMENTS TABLE
-- ============================================
-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can post comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;

-- Everyone can view comments (no authentication required)
CREATE POLICY "Anyone can view comments" 
ON public.comments 
FOR SELECT 
USING (true);

-- Authenticated users can post comments (must be logged in)
CREATE POLICY "Authenticated users can post comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment" 
ON public.comments 
FOR DELETE 
USING (public.is_admin());

-- 5. AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_comments_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comments_updated_at ON public.comments;

CREATE TRIGGER trigger_update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW 
EXECUTE FUNCTION update_comments_updated_at();

-- 6. VERIFICATION QUERY
-- ============================================
-- Run this to verify everything was created successfully
SELECT 'comments table' as item, 
CASE 
  WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'comments') 
  THEN '✓ Created' 
  ELSE '✗ Failed' 
END as status
UNION ALL
SELECT 'comments indexes', 
CASE 
  WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_content') 
  THEN '✓ Created' 
  ELSE '✗ Failed' 
END;

