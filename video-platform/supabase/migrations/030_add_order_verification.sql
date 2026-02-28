-- Add verification_token column to item_purchases
ALTER TABLE public.item_purchases
  ADD COLUMN IF NOT EXISTS verification_token TEXT;

-- Update status CHECK constraint to include 'paid'
ALTER TABLE public.item_purchases DROP CONSTRAINT IF EXISTS item_purchases_status_check;
ALTER TABLE public.item_purchases ADD CONSTRAINT item_purchases_status_check
  CHECK (status IN ('pending', 'paid', 'completed', 'failed'));

-- Drop the UNIQUE constraint on stripe_session_id to support multi-item purchases
-- (multiple items in one Stripe checkout session share the same session ID)
ALTER TABLE public.item_purchases DROP CONSTRAINT IF EXISTS item_purchases_stripe_session_id_key;

-- New orders will be created with status 'paid' and transition to 'completed' via QR verification
