
import React from 'react';
import { motion } from 'framer-motion';

const AboutHero = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-salon-purple/10 via-salon-rose/10 to-salon-gold/10 overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            About Iconic Unisex Salon
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Where Style Meets Wellness
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-32 h-32 mx-auto rounded-full bg-gradient-salon flex items-center justify-center text-white text-4xl font-bold shadow-2xl"
          >
            IS
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-salon-purple/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-salon-rose/20 rounded-full blur-xl"></div>
    </section>
  );
};

export default AboutHero;
