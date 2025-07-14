
import { supabase } from '@/integrations/supabase/client';
import type { Service } from '@/types/service';

export const useServices = () => {
  const fetchFeaturedServices = async (): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured services:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchFeaturedServices:', error);
      return [];
    }
  };

  const fetchServicesByCategory = async (categoryId: string): Promise<Service[]> => {
    try {
      // This query will utilize the idx_services_category_id index
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching services by category:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchServicesByCategory:', error);
      return [];
    }
  };

  const fetchAllServices = async (): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('is_active', true)
        .order('category_id', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching all services:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchAllServices:', error);
      return [];
    }
  };

  return {
    fetchFeaturedServices,
    fetchServicesByCategory,
    fetchAllServices,
  };
};
