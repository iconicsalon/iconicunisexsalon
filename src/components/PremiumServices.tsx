
import React from 'react';
import ServiceCard from '@/components/ServiceCard';

const PremiumServices = () => {
  const services = [
    {
      title: 'Haircut & Styling',
      icon: '✂️',
      category: 'unisex' as const,
      description: 'Professional cuts and styling for all hair types',
      videoUrl: '/videos/haircut.mp4', // These would be actual video files
    },
    {
      title: 'Hair Coloring',
      icon: '🎨',
      category: 'unisex' as const,
      description: 'Expert color treatments and highlights',
      videoUrl: '/videos/coloring.mp4',
    },
    {
      title: 'Facial & Skincare',
      icon: '✨',
      category: 'unisex' as const,
      description: 'Rejuvenating facials for glowing skin',
      videoUrl: '/videos/facial.mp4',
    },
    {
      title: 'Waxing',
      icon: '🧖‍♀️',
      category: 'female' as const,
      description: 'Smooth, professional waxing services',
      videoUrl: '/videos/waxing.mp4',
    },
    {
      title: 'Manicure & Pedicure',
      icon: '💅',
      category: 'unisex' as const,
      description: 'Complete nail care and styling',
      videoUrl: '/videos/nails.mp4',
    },
    {
      title: 'Makeup Services',
      icon: '💄',
      category: 'female' as const,
      description: 'Professional makeup for special occasions',
      videoUrl: '/videos/makeup.mp4',
    },
    {
      title: 'Massage & Relaxation',
      icon: '🧘',
      category: 'unisex' as const,
      description: 'Therapeutic massage and wellness treatments',
      videoUrl: '/videos/massage.mp4',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Our Premium Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience luxury and expertise with our comprehensive range of beauty and grooming services
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={service.title} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <ServiceCard {...service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumServices;
