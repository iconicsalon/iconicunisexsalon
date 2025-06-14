
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Service, ServiceCategory } from '@/types/service';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all active services with categories
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services.",
        variant: "destructive",
      });
    }
  };

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load service categories.",
        variant: "destructive",
      });
    }
  };

  // Fetch featured services
  const fetchFeaturedServices = async (): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured services:', error);
      return [];
    }
  };

  // Filter services by gender and category
  const filterServices = async (gender?: string, categoryId?: string): Promise<Service[]> => {
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('is_active', true);

      if (gender) {
        query = query.or(`gender.eq.${gender},gender.eq.unisex`);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      query = query.order('sort_order', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering services:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchServices(), fetchCategories()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    services,
    categories,
    loading,
    fetchServices,
    fetchCategories,
    fetchFeaturedServices,
    filterServices,
  };
};
