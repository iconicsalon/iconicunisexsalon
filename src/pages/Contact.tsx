
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ContactHeader from '@/components/ContactHeader';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-16"
      >
        <ContactHeader />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <SocialMediaLinks />
            <ContactForm />
          </div>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default Contact;
