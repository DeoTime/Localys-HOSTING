-- Add coupon tracking columns to item_purchases
ALTER TABLE public.item_purchases
  ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_percentage INTEGER;