-- ============================================
-- FIX PURCHASES RLS POLICY
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can update own pending purchases" ON public.purchases;

-- Create fixed policy: Users can update their own purchases (status: pending -> completed)
-- USING = which rows can be selected for update (must be own pending purchase)
-- WITH CHECK = what values are allowed after update (must still be own row)
CREATE POLICY "Users can update own pending purchases"
  ON public.purchases FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Verify the policy was created
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'purchases';
