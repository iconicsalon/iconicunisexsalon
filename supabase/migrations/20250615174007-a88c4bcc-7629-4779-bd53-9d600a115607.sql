
-- Enable RLS on service_categories table
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read service categories
-- Service categories are reference data that should be publicly readable
CREATE POLICY "service_categories_select_policy" ON public.service_categories
  FOR SELECT USING (true);

-- Only allow authenticated users (likely admins) to modify service categories
CREATE POLICY "service_categories_insert_policy" ON public.service_categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "service_categories_update_policy" ON public.service_categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "service_categories_delete_policy" ON public.service_categories
  FOR DELETE USING (auth.role() = 'authenticated');
