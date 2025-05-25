
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Users } from 'lucide-react';

const SalonStory = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            Our Story
          </h2>
          
          <div className="prose prose-lg mx-auto mb-12">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Iconic Unisex Salon was founded in Bengaluru with one goal – to create a space where men and women can feel confident, relaxed, and truly iconic. With expert stylists, spa professionals, and a warm ambiance, we offer curated experiences designed for every individual.
            </p>
            
            <motion.blockquote 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="border-l-4 border-salon-purple bg-gray-50 pl-6 py-4 my-8 italic text-gray-800"
            >
              "We believe that every person deserves to feel their absolute best. Our mission is to provide exceptional beauty and wellness services that enhance not just your appearance, but your confidence and well-being."
            </motion.blockquote>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-salon rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600">Premium services with attention to every detail</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-salon rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Care</h3>
              <p className="text-gray-600">Personalized treatments for your unique needs</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-salon rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">Building lasting relationships with our clients</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SalonStory;
