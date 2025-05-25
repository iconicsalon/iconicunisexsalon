
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
            { name: 'Hair Cut', gender: 'unisex' as const },
            { name: 'Hair Trimming', gender: 'unisex' as const },
            { name: 'Beard Trimming', gender: 'male' as const },
            { name: 'Mustache Styling', gender: 'male' as const },
            { name: 'Hair Styling', gender: 'unisex' as const },
            { name: 'Blow Dry', gender: 'female' as const },
          ]
        },
        {
          title: 'Hair Coloring',
          services: [
            { name: 'Hair Coloring', gender: 'unisex' as const },
            { name: 'Hair Highlights', gender: 'unisex' as const },
            { name: 'Root Touch Up', gender: 'unisex' as const },
            { name: 'Global Coloring', gender: 'unisex' as const },
            { name: 'Ombre/Balayage', gender: 'female' as const },
          ]
        },
        {
          title: 'Hair Treatments',
          services: [
            { name: 'Hair Spa', gender: 'unisex' as const },
            { name: 'Hair Straightening', gender: 'unisex' as const },
            { name: 'Hair Smoothening', gender: 'unisex' as const },
            { name: 'Keratin Treatment', gender: 'unisex' as const },
            { name: 'Anti-Dandruff Treatment', gender: 'unisex' as const },
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
            { name: 'Eyebrow Threading', gender: 'unisex' as const },
            { name: 'Upper Lip Threading', gender: 'female' as const },
            { name: 'Full Face Threading', gender: 'female' as const },
            { name: 'Chin Threading', gender: 'female' as const },
          ]
        },
        {
          title: 'Bleach & Clean-Ups',
          services: [
            { name: 'Face Bleach', gender: 'female' as const },
            { name: 'Clean Up', gender: 'unisex' as const },
            { name: 'Fruit Clean Up', gender: 'unisex' as const },
            { name: 'Detan Pack', gender: 'unisex' as const },
          ]
        },
        {
          title: 'Facials',
          services: [
            { name: 'Classic Facial', gender: 'unisex' as const },
            { name: 'Gold Facial', gender: 'unisex' as const },
            { name: 'Diamond Facial', gender: 'unisex' as const },
            { name: 'Anti-Aging Facial', gender: 'unisex' as const },
            { name: 'Hydrating Facial', gender: 'unisex' as const },
            { name: 'Acne Treatment Facial', gender: 'unisex' as const },
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
            { name: 'Full Arms Wax', gender: 'female' as const },
            { name: 'Full Legs Wax', gender: 'female' as const },
            { name: 'Underarms Wax', gender: 'female' as const },
            { name: 'Bikini Wax', gender: 'female' as const },
            { name: 'Back Wax', gender: 'unisex' as const },
            { name: 'Chest Wax', gender: 'male' as const },
          ]
        },
        {
          title: 'Nail Care',
          services: [
            { name: 'Manicure', gender: 'unisex' as const },
            { name: 'Pedicure', gender: 'unisex' as const },
            { name: 'Gel Manicure', gender: 'unisex' as const },
            { name: 'Nail Art', gender: 'female' as const },
            { name: 'Nail Extensions', gender: 'female' as const },
          ]
        },
        {
          title: 'Body Care',
          services: [
            { name: 'Body Polishing', gender: 'unisex' as const },
            { name: 'Body Scrub', gender: 'unisex' as const },
            { name: 'Body Wrap', gender: 'unisex' as const },
            { name: 'Tan Removal', gender: 'unisex' as const },
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
            { name: 'Party Makeup', gender: 'female' as const },
            { name: 'Bridal Makeup', gender: 'female' as const },
            { name: 'Engagement Makeup', gender: 'female' as const },
            { name: 'Pre-Wedding Shoot Makeup', gender: 'female' as const },
            { name: 'HD Makeup', gender: 'female' as const },
          ]
        },
        {
          title: 'Special Services',
          services: [
            { name: 'Saree Draping', gender: 'female' as const },
            { name: 'Hair Styling for Events', gender: 'female' as const },
            { name: 'Mehendi Application', gender: 'female' as const },
            { name: 'Makeup Trial', gender: 'female' as const },
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
            { name: 'Head Massage', gender: 'unisex' as const },
            { name: 'Neck & Shoulder Massage', gender: 'unisex' as const },
            { name: 'Full Body Massage', gender: 'unisex' as const },
            { name: 'Foot Massage', gender: 'unisex' as const },
            { name: 'Hot Stone Massage', gender: 'unisex' as const },
            { name: 'Aromatherapy Massage', gender: 'unisex' as const },
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
