-- Create or fix coin_purchases table with proper RLS

CREATE TABLE IF NOT EXISTS public.coin_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL,
  amount_cents INTEGER,
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_coin_purchases_user_id ON public.coin_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_created_at ON public.coin_purchases(created_at DESC);

-- Enable RLS if not already enabled
ALTER TABLE public.coin_purchases ENABLE ROW LEVEL SECURITY;

-- Drop old policies to recreate them
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.coin_purchases;
DROP POLICY IF EXISTS "System can insert coin purchases" ON public.coin_purchases;

-- Create proper RLS policies
CREATE POLICY "Users can view their own purchases"
  ON public.coin_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert coin purchases"
  ON public.coin_purchases
  FOR INSERT
  WITH CHECK (true);

-- Recreate trigger for updated_at
DROP TRIGGER IF EXISTS coin_purchases_updated_at ON public.coin_purchases;

CREATE OR REPLACE FUNCTION public.handle_coin_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coin_purchases_updated_at
  BEFORE UPDATE ON public.coin_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_coin_purchases_updated_at();

