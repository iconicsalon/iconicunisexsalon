
import React from 'react';
import { motion } from 'framer-motion';

interface Section {
  id: string;
  title: string;
  subcategories: any[];
}

interface ServicesSidebarProps {
  sections: Section[];
}

const ServicesSidebar: React.FC<ServicesSidebarProps> = ({ sections }) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Account for sticky navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg p-6 border border-gray-100"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        Quick Navigation
      </h3>
      
      <nav className="space-y-2">
        {sections.map((section, index) => (
          <motion.button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-salon-purple hover:bg-salon-purple/10 transition-colors duration-200"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            {section.title}
          </motion.button>
        ))}
      </nav>

      <div className="mt-6 p-4 bg-gradient-card rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          Can't find what you're looking for?
        </p>
        <button className="w-full mt-2 px-4 py-2 bg-salon-purple text-white rounded-md text-sm font-medium hover:bg-salon-purple/90 transition-colors">
          Contact Us
        </button>
      </div>
    </motion.div>
  );
};

export default ServicesSidebar;
