-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL DEFAULT 20,
  discount_amount INTEGER,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create user_coupons table to track which coupons users have
CREATE TABLE IF NOT EXISTS public.user_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coupon_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON public.user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_is_used ON public.user_coupons(is_used);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons (read-only for authenticated users)
CREATE POLICY "coupons_read" ON public.coupons
  FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- RLS Policies for user_coupons (users can only see their own)
CREATE POLICY "user_coupons_read" ON public.user_coupons
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_coupons_update" ON public.user_coupons
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
