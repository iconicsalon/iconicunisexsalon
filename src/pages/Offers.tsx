
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OffersFilter from '@/components/OffersFilter';
import OfferSection from '@/components/OfferSection';

type FilterType = 'popular' | 'best-seller' | 'men-women' | 'women-men';

const Offers = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('popular');

  const menOffers = [
    {
      id: 'm1',
      title: 'Complete Grooming',
      services: ['Haircut', 'Beard', 'Wash', 'Cleanup', 'Detan'],
      originalPrice: 1550,
      discountedPrice: 999,
      badge: '🔥 Best Seller',
      isPopular: true,
      isBestSeller: true
    },
    {
      id: 'm2',
      title: 'Premium Hair Care',
      services: ['Haircut', 'Beard', 'Wash', 'Hair Spa (massage)'],
      originalPrice: 1400,
      discountedPrice: 899,
      badge: '⚡ 36% Off',
      isPopular: true,
      isBestSeller: false
    },
    {
      id: 'm3',
      title: 'Style & Color',
      services: ['Haircut', 'Beard', 'Wash', 'Hair Color'],
      originalPrice: 1500,
      discountedPrice: 1199,
      badge: '💫 New',
      isPopular: false,
      isBestSeller: false
    },
    {
      id: 'm4',
      title: 'Royal Treatment',
      services: ['Wine Facial', 'Detan', 'Haircut', 'Beard'],
      originalPrice: 2450,
      discountedPrice: 1999,
      badge: '👑 Premium',
      isPopular: false,
      isBestSeller: true
    }
  ];

  const womenOffers = [
    {
      id: 'w1',
      title: 'Hair Nourishing Package',
      services: ['Haircut (any)', 'Nourishing Hair SPA', 'Head Massage'],
      originalPrice: 2000,
      discountedPrice: 1399,
      badge: '🔥 Best Seller',
      isPopular: true,
      isBestSeller: true
    },
    {
      id: 'w2',
      title: 'Root Touch Up Special',
      services: ['Haircut (any)', 'Root Touch Up [Ammonia Free]'],
      originalPrice: 2200,
      discountedPrice: 1599,
      badge: '🌿 Ammonia Free',
      isPopular: true,
      isBestSeller: false
    },
    {
      id: 'w3',
      title: 'Global Color Package',
      services: ['Haircut (any)', 'Global Hair Color [Ammonia Free]'],
      originalPrice: 4199,
      discountedPrice: 3099,
      badge: '⚡ 26% Off',
      isPopular: false,
      isBestSeller: false
    },
    {
      id: 'w4',
      title: 'Keratin Treatment',
      services: ['Hair Keratin Treatment'],
      originalPrice: 6000,
      discountedPrice: 5000,
      badge: '💎 Premium',
      isPopular: false,
      isBestSeller: true
    },
    {
      id: 'w5',
      title: 'Wax & Facial Combo',
      services: ['Rica wax (full arms)', 'Wine Facial', 'Half Legs'],
      originalPrice: 2500,
      discountedPrice: 1999,
      badge: '🔥 Hot Deal',
      isPopular: true,
      isBestSeller: false
    },
    {
      id: 'w6',
      title: 'Full Body Pamper',
      services: ['Honey wax (full arms & legs)', 'Hair SPA', 'Head Massage'],
      originalPrice: 2300,
      discountedPrice: 1899,
      badge: '⚡ Limited Time',
      isPopular: true,
      isBestSeller: true
    },
    {
      id: 'w7',
      title: 'Complete Beauty',
      services: ['Raga Facial', 'Detan', 'Rica wax (full arms & legs)'],
      originalPrice: 3750,
      discountedPrice: 3099,
      badge: '🌟 Signature',
      isPopular: false,
      isBestSeller: false
    },
    {
      id: 'w8',
      title: 'Refresh & Rejuvenate',
      services: ['Lotus Cleanup', 'Detan', 'Hair SPA'],
      originalPrice: 2950,
      discountedPrice: 2299,
      badge: '🌸 Relaxing',
      isPopular: false,
      isBestSeller: false
    }
  ];

  const sortOffers = (offers: typeof menOffers) => {
    switch (activeFilter) {
      case 'popular':
        return offers.filter(offer => offer.isPopular);
      case 'best-seller':
        return offers.filter(offer => offer.isBestSeller);
      default:
        return offers;
    }
  };

  const getSectionOrder = () => {
    if (activeFilter === 'women-men') {
      return [
        { title: "Women's Exclusive Offers", offers: sortOffers(womenOffers), gender: 'women' as const },
        { title: "Men's Exclusive Offers", offers: sortOffers(menOffers), gender: 'men' as const }
      ];
    }
    return [
      { title: "Men's Exclusive Offers", offers: sortOffers(menOffers), gender: 'men' as const },
      { title: "Women's Exclusive Offers", offers: sortOffers(womenOffers), gender: 'women' as const }
    ];
  };

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
              Exclusive Combo Offers
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Save big with our specially curated service combinations
            </p>
          </div>
        </motion.section>

        {/* Filters */}
        <div className="container mx-auto px-4 py-6">
          <OffersFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Offers Sections */}
        <div className="container mx-auto px-4 pb-8">
          {getSectionOrder().map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <OfferSection 
                title={section.title}
                offers={section.offers}
                gender={section.gender}
              />
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Offers;
