
-- First, let me check and fix the RLS policies for bookings table to ensure admins can update booking statuses
-- Drop existing problematic policies
DROP POLICY IF EXISTS "bookings_update_policy" ON public.bookings;

-- Create a new policy that allows both users to update their own bookings AND admins to update any booking
CREATE POLICY "bookings_update_policy" ON public.bookings
  FOR UPDATE USING (
    user_id = (select auth.uid()) OR 
    public.is_current_user_admin() = true
  );

-- Also ensure the admin function works correctly by recreating it with better error handling
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
