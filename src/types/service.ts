
export interface ServiceCategory {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number | null;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  category_id: string | null;
  price: number | null;
  duration_minutes: number | null;
  gender: string | null;
  description: string | null;
  image_url: string | null;
  is_featured: boolean | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string;
  // Joined data
  category?: ServiceCategory;
}
