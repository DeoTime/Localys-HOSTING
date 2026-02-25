-- Create menus table
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  menu_name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR DEFAULT 'General',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on menus table
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- Enable RLS on menu_items table
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for menus
CREATE POLICY "Users can view all menus"
  ON public.menus
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create menus for themselves"
  ON public.menus
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menus"
  ON public.menus
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menus"
  ON public.menus
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for menu_items
CREATE POLICY "Anyone can view menu items"
  ON public.menu_items
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create menu items for their menus"
  ON public.menu_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menu items"
  ON public.menu_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menu items"
  ON public.menu_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_menus_user_id ON public.menus(user_id);
CREATE INDEX idx_menus_business_id ON public.menus(business_id);
CREATE INDEX idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX idx_menu_items_user_id ON public.menu_items(user_id);
