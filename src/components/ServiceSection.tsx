
import React from 'react';
import { motion } from 'framer-motion';
import ServiceItem from '@/components/ServiceItem';
import Subcategory from '@/components/Subcategory';

interface Service {
  name: string;
  gender: 'male' | 'female' | 'unisex';
}

interface Subcategory {
  title: string;
  services: Service[];
}

interface Section {
  id: string;
  title: string;
  subcategories: Subcategory[];
}

interface ServiceSectionProps {
  section: Section;
}

const ServiceSection: React.FC<ServiceSectionProps> = ({ section }) => {
  return (
    <motion.section 
      className="mb-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* Section Title */}
      <div className="text-2xl md:text-3xl font-semibold text-gray-800 border-b-2 border-salon-purple pb-2 mb-6">
        {section.title}
      </div>

      {/* Subcategories */}
      {section.subcategories.map((subcategory, index) => (
        <div key={subcategory.title} className="mb-8">
          <Subcategory title={subcategory.title} />
          
          {/* Services Grid */}
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            {subcategory.services.map((service, serviceIndex) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: serviceIndex * 0.05 }}
                viewport={{ once: true }}
              >
                <ServiceItem service={service} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}
    </motion.section>
  );
};

export default ServiceSection;
