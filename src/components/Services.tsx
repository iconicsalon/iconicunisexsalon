
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Services = () => {
  const services = [
    {
      title: 'Hair Styling',
      description: 'Professional cuts, styling, and hair treatments for all hair types',
      icon: '✂️',
      category: 'Hair Care',
      popular: true
    },
    {
      title: 'Hair Coloring',
      description: 'Expert color treatments, highlights, and creative color transformations',
      icon: '🎨',
      category: 'Hair Care',
      popular: true
    },
    {
      title: 'Skincare & Facials',
      description: 'Rejuvenating facials and advanced skincare treatments',
      icon: '✨',
      category: 'Skincare',
      popular: false
    },
    {
      title: 'Massage Therapy',
      description: 'Relaxing full-body massages and therapeutic treatments',
      icon: '🧘',
      category: 'Wellness',
      popular: false
    },
    {
      title: 'Nail Care',
      description: 'Professional manicures, pedicures, and nail art',
      icon: '💅',
      category: 'Beauty',
      popular: true
    },
    {
      title: 'Makeup Services',
      description: 'Professional makeup for special occasions and events',
      icon: '💄',
      category: 'Beauty',
      popular: false
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-salon-light to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Our <span className="gradient-text">Premium Services</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive range of beauty and wellness services, 
            crafted to bring out your best self.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <Card 
              key={service.title}
              className="group hover-scale bg-gradient-card border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <CardContent className="p-6">
                {/* Popular Badge */}
                {service.popular && (
                  <div className="inline-flex items-center bg-gradient-salon text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    ⭐ Popular
                  </div>
                )}

                {/* Service Icon */}
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>

                {/* Category */}
                <div className="text-sm text-salon-purple font-medium mb-2">
                  {service.category}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-salon-purple transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* CTA */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-salon-purple hover:bg-salon-purple/10 group-hover:bg-salon-purple group-hover:text-white transition-all duration-300"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Services CTA */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-salon hover:opacity-90 transition-all duration-300 hover:scale-105 px-8 py-6 text-lg font-semibold rounded-xl shadow-xl"
          >
            View All Services
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;
