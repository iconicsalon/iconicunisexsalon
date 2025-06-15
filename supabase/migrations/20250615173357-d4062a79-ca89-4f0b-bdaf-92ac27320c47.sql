
-- Create index on bookings.user_id for faster user-specific booking queries
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);

-- Create index on services.category_id for faster category-based service queries
CREATE INDEX idx_services_category_id ON public.services(category_id);

-- Optional: Create a composite index on bookings for common query patterns
CREATE INDEX idx_bookings_user_status ON public.bookings(user_id, status);

-- Optional: Create index on booking_date for date-based filtering
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
