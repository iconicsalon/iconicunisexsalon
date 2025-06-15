
-- Drop existing policies that have performance issues
DROP POLICY IF EXISTS "service_categories_insert_policy" ON public.service_categories;
DROP POLICY IF EXISTS "service_categories_update_policy" ON public.service_categories;  
DROP POLICY IF EXISTS "service_categories_delete_policy" ON public.service_categories;

-- Create optimized policies that use (select auth.role()) instead of auth.role()
-- This prevents re-evaluation for each row and improves performance

CREATE POLICY "service_categories_insert_policy" ON public.service_categories
  FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

CREATE POLICY "service_categories_update_policy" ON public.service_categories
  FOR UPDATE USING ((select auth.role()) = 'authenticated');

CREATE POLICY "service_categories_delete_policy" ON public.service_categories
  FOR DELETE USING ((select auth.role()) = 'authenticated');
