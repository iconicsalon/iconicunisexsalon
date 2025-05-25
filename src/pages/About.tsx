
import React from 'react';
import { motion } from 'framer-motion';
import AboutHero from '@/components/AboutHero';
import SalonStory from '@/components/SalonStory';
import MeetTheTeam from '@/components/MeetTheTeam';
import GoogleReviews from '@/components/GoogleReviews';
import Navbar from '@/components/Navbar';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-16"
      >
        <AboutHero />
        <SalonStory />
        <MeetTheTeam />
        <GoogleReviews />
      </motion.main>
    </div>
  );
};

export default About;
