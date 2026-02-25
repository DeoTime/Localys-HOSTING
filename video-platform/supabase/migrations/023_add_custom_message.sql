-- Add custom_message column to businesses table
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS custom_message TEXT DEFAULT 'Hi, interested in this!';
