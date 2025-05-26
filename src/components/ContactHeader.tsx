
import React from 'react';
import { motion } from 'framer-motion';

const ContactHeader = () => {
  return (
    <section className="relative py-16 bg-gradient-to-br from-salon-purple/10 via-salon-rose/10 to-salon-gold/10">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Let's Connect
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question or want to book offline? Reach us directly!
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactHeader;
