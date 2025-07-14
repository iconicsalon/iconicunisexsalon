
-- Add foreign key constraint between bookings and profiles
ALTER TABLE public.bookings 
ADD CONSTRAINT fk_bookings_user_profile 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;
