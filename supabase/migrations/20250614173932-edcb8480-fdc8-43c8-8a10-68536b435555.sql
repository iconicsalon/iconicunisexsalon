
-- Add new columns to services table
ALTER TABLE services ADD COLUMN description text;
ALTER TABLE services ADD COLUMN image_url text;
ALTER TABLE services ADD COLUMN is_featured boolean DEFAULT false;
ALTER TABLE services ADD COLUMN sort_order integer;
ALTER TABLE services ADD COLUMN is_active boolean DEFAULT true;

-- Create service_categories table for better normalization
CREATE TABLE service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text,
  sort_order integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert existing categories into the new table
INSERT INTO service_categories (name, icon, sort_order) VALUES
  ('Haircut & Styling', '✂️', 1),
  ('Hair Coloring / Treatment', '🎨', 2),
  ('Facial & Skincare', '💆‍♀️', 3),
  ('Waxing', '🧖‍♀️', 4),
  ('Manicure & Pedicure', '💅', 5),
  ('Makeup Services', '💄', 6),
  ('Massage & Relaxation', '🧘', 7);

-- Add category_id column to services table
ALTER TABLE services ADD COLUMN category_id uuid REFERENCES service_categories(id);

-- Update existing services to reference the new category table
UPDATE services SET category_id = (
  SELECT id FROM service_categories WHERE name = services.category
);

-- Drop the old category column after migration
ALTER TABLE services DROP COLUMN category;

-- Set default sort_order for existing services
UPDATE services SET sort_order = 
  CASE 
    WHEN name LIKE '%Cut%' OR name LIKE '%Haircut%' THEN 1
    WHEN name LIKE '%Color%' OR name LIKE '%Highlight%' THEN 2  
    WHEN name LIKE '%Facial%' OR name LIKE '%Skin%' THEN 3
    WHEN name LIKE '%Wax%' THEN 4
    WHEN name LIKE '%Mani%' OR name LIKE '%Pedi%' OR name LIKE '%Nail%' THEN 5
    WHEN name LIKE '%Makeup%' THEN 6
    WHEN name LIKE '%Massage%' THEN 7
    ELSE 99
  END;

-- Mark some services as featured (removed LIMIT clause)
UPDATE services SET is_featured = true 
WHERE name IN ('Hair Cut', 'Hair Coloring', 'Classic Facial', 'Full Body Massage');
