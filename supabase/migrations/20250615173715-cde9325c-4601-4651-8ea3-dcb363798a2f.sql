
-- First, drop all existing problematic RLS policies to clean up duplicates
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Create optimized RLS policies for bookings table
-- Using (select auth.uid()) to avoid re-evaluation per row
CREATE POLICY "bookings_select_policy" ON public.bookings
  FOR SELECT USING (
    user_id = (select auth.uid()) OR 
    public.is_current_user_admin() = true
  );

CREATE POLICY "bookings_insert_policy" ON public.bookings
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "bookings_update_policy" ON public.bookings
  FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "bookings_delete_policy" ON public.bookings
  FOR DELETE USING (user_id = (select auth.uid()));

-- Create optimized RLS policies for profiles table
-- Using (select auth.uid()) to avoid re-evaluation per row
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    id = (select auth.uid()) OR 
    public.is_current_user_admin() = true
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (id = (select auth.uid()));

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (id = (select auth.uid()));

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE USING (id = (select auth.uid()));
