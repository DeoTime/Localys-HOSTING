-- Create item_purchases table to track all item purchases
CREATE TABLE IF NOT EXISTS public.item_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_item_purchases_seller_id ON public.item_purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_item_purchases_buyer_id ON public.item_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_item_purchases_item_id ON public.item_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_item_purchases_stripe_session_id ON public.item_purchases(stripe_session_id);

-- Enable RLS
ALTER TABLE public.item_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view purchases of items they sold or bought
CREATE POLICY "Users can view their purchases"
  ON public.item_purchases
  FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Only the system can insert purchases
CREATE POLICY "System can insert purchases"
  ON public.item_purchases
  FOR INSERT
  WITH CHECK (true);
