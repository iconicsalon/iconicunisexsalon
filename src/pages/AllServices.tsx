
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceSection from '@/components/ServiceSection';
import ServicesSidebar from '@/components/ServicesSidebar';

const AllServices = () => {
  const servicesData = [
    {
      id: 'hair',
      title: 'Hair Services',
      subcategories: [
        {
          title: 'Haircuts & Styling',
          services: [
            { name: 'Hair Cut', gender: 'unisex' },
            { name: 'Hair Trimming', gender: 'unisex' },
            { name: 'Beard Trimming', gender: 'male' },
            { name: 'Mustache Styling', gender: 'male' },
            { name: 'Hair Styling', gender: 'unisex' },
            { name: 'Blow Dry', gender: 'female' },
          ]
        },
        {
          title: 'Hair Coloring',
          services: [
            { name: 'Hair Coloring', gender: 'unisex' },
            { name: 'Hair Highlights', gender: 'unisex' },
            { name: 'Root Touch Up', gender: 'unisex' },
            { name: 'Global Coloring', gender: 'unisex' },
            { name: 'Ombre/Balayage', gender: 'female' },
          ]
        },
        {
          title: 'Hair Treatments',
          services: [
            { name: 'Hair Spa', gender: 'unisex' },
            { name: 'Hair Straightening', gender: 'unisex' },
            { name: 'Hair Smoothening', gender: 'unisex' },
            { name: 'Keratin Treatment', gender: 'unisex' },
            { name: 'Anti-Dandruff Treatment', gender: 'unisex' },
          ]
        }
      ]
    },
    {
      id: 'face',
      title: 'Face Services',
      subcategories: [
        {
          title: 'Threading',
          services: [
            { name: 'Eyebrow Threading', gender: 'unisex' },
            { name: 'Upper Lip Threading', gender: 'female' },
            { name: 'Full Face Threading', gender: 'female' },
            { name: 'Chin Threading', gender: 'female' },
          ]
        },
        {
          title: 'Bleach & Clean-Ups',
          services: [
            { name: 'Face Bleach', gender: 'female' },
            { name: 'Clean Up', gender: 'unisex' },
            { name: 'Fruit Clean Up', gender: 'unisex' },
            { name: 'Detan Pack', gender: 'unisex' },
          ]
        },
        {
          title: 'Facials',
          services: [
            { name: 'Classic Facial', gender: 'unisex' },
            { name: 'Gold Facial', gender: 'unisex' },
            { name: 'Diamond Facial', gender: 'unisex' },
            { name: 'Anti-Aging Facial', gender: 'unisex' },
            { name: 'Hydrating Facial', gender: 'unisex' },
            { name: 'Acne Treatment Facial', gender: 'unisex' },
          ]
        }
      ]
    },
    {
      id: 'body',
      title: 'Body Services',
      subcategories: [
        {
          title: 'Waxing',
          services: [
            { name: 'Full Arms Wax', gender: 'female' },
            { name: 'Full Legs Wax', gender: 'female' },
            { name: 'Underarms Wax', gender: 'female' },
            { name: 'Bikini Wax', gender: 'female' },
            { name: 'Back Wax', gender: 'unisex' },
            { name: 'Chest Wax', gender: 'male' },
          ]
        },
        {
          title: 'Nail Care',
          services: [
            { name: 'Manicure', gender: 'unisex' },
            { name: 'Pedicure', gender: 'unisex' },
            { name: 'Gel Manicure', gender: 'unisex' },
            { name: 'Nail Art', gender: 'female' },
            { name: 'Nail Extensions', gender: 'female' },
          ]
        },
        {
          title: 'Body Care',
          services: [
            { name: 'Body Polishing', gender: 'unisex' },
            { name: 'Body Scrub', gender: 'unisex' },
            { name: 'Body Wrap', gender: 'unisex' },
            { name: 'Tan Removal', gender: 'unisex' },
          ]
        }
      ]
    },
    {
      id: 'makeup',
      title: 'Makeup Services',
      subcategories: [
        {
          title: 'Professional Makeup',
          services: [
            { name: 'Party Makeup', gender: 'female' },
            { name: 'Bridal Makeup', gender: 'female' },
            { name: 'Engagement Makeup', gender: 'female' },
            { name: 'Pre-Wedding Shoot Makeup', gender: 'female' },
            { name: 'HD Makeup', gender: 'female' },
          ]
        },
        {
          title: 'Special Services',
          services: [
            { name: 'Saree Draping', gender: 'female' },
            { name: 'Hair Styling for Events', gender: 'female' },
            { name: 'Mehendi Application', gender: 'female' },
            { name: 'Makeup Trial', gender: 'female' },
          ]
        }
      ]
    },
    {
      id: 'massage',
      title: 'Massage & Wellness',
      subcategories: [
        {
          title: 'Massage Therapy',
          services: [
            { name: 'Head Massage', gender: 'unisex' },
            { name: 'Neck & Shoulder Massage', gender: 'unisex' },
            { name: 'Full Body Massage', gender: 'unisex' },
            { name: 'Foot Massage', gender: 'unisex' },
            { name: 'Hot Stone Massage', gender: 'unisex' },
            { name: 'Aromatherapy Massage', gender: 'unisex' },
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-salon text-white py-16"
        >
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Our Complete Service Menu
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Discover our comprehensive range of premium beauty and grooming services
            </p>
          </div>
        </motion.section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation (Desktop) */}
            <div className="hidden lg:block lg:w-64 lg:sticky lg:top-24 lg:h-fit">
              <ServicesSidebar sections={servicesData} />
            </div>

            {/* Services Content */}
            <div className="flex-1">
              {servicesData.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  id={section.id}
                >
                  <ServiceSection section={section} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllServices;
