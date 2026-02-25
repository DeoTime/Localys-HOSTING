-- Add business_type and business_hours columns to businesses table
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT NULL;

-- Create an index on business_type for faster queries
CREATE INDEX IF NOT EXISTS idx_businesses_business_type ON public.businesses(business_type);
