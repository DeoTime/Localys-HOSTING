-- Update custom_message to custom_messages (array)
ALTER TABLE public.businesses
DROP COLUMN IF EXISTS custom_messages;

ALTER TABLE public.businesses
ADD COLUMN custom_messages JSONB DEFAULT '["Hi, interested in this!"]'::jsonb;

