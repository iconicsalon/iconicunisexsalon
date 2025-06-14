
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useServices } from '@/hooks/useServices';
import type { Service } from '@/types/service';

const FeaturedServices = () => {
  const { fetchFeaturedServices } = useServices();
  const [featuredServices, setFeaturedServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadFeaturedServices = async () => {
      setLoading(true);
      const services = await fetchFeaturedServices();
      setFeaturedServices(services);
      setLoading(false);
    };

    loadFeaturedServices();
  }, [fetchFeaturedServices]);

  if (loading) {
    return <div className="text-center py-8">Loading featured services...</div>;
  }

  if (featuredServices.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Featured Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our most popular and recommended services
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group relative overflow-hidden hover-scale cursor-pointer h-64">
                <CardContent className="p-0 h-full relative">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-card" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
                  
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <Badge className="bg-salon-purple text-white">
                        ⭐ Featured
                      </Badge>
                      {service.category?.icon && (
                        <div className="text-2xl">{service.category.icon}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-gray-200 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      {service.price && (
                        <p className="text-lg font-bold text-white">
                          ₹{service.price}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
