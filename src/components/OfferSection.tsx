
import React from 'react';
import { motion } from 'framer-motion';
import OfferCard from './OfferCard';

interface Offer {
  id: string;
  title: string;
  services: string[];
  originalPrice: number;
  discountedPrice: number;
  badge: string;
  isPopular: boolean;
  isBestSeller: boolean;
}

interface OfferSectionProps {
  title: string;
  offers: Offer[];
  gender: 'men' | 'women';
}

const OfferSection: React.FC<OfferSectionProps> = ({ title, offers, gender }) => {
  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">{gender === 'men' ? '👨‍🦱' : '👩‍🦰'}</span>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex-shrink-0 snap-center"
          >
            <OfferCard offer={offer} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default OfferSection;
