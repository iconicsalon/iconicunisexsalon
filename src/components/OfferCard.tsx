
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface OfferCardProps {
  offer: Offer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const savings = offer.originalPrice - offer.discountedPrice;
  const savingsPercentage = Math.round((savings / offer.originalPrice) * 100);

  const handleBookNow = () => {
    // This would typically open a booking modal or navigate to booking page
    console.log('Book offer:', offer.id);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="w-80 sm:w-72 md:w-80"
    >
      <Card className="h-full border-2 hover:border-salon-purple transition-all duration-300 shadow-md hover:shadow-lg">
        <CardContent className="p-6">
          {/* Badge */}
          <div className="flex justify-between items-start mb-4">
            <Badge variant="secondary" className="bg-gradient-salon text-white font-semibold">
              {offer.badge}
            </Badge>
            <div className="text-right">
              <span className="text-green-600 font-bold text-sm">
                Save ₹{savings}
              </span>
              <div className="text-xs text-gray-500">
                ({savingsPercentage}% off)
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
            {offer.title}
          </h3>

          {/* Services */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Includes:</p>
            <ul className="space-y-1">
              {offer.services.map((service, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-salon-purple font-bold">•</span>
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">
                ₹{offer.discountedPrice.toLocaleString()}
              </span>
              <span className="text-lg text-gray-500 line-through">
                ₹{offer.originalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Book Now Button */}
          <Button 
            onClick={handleBookNow}
            className="w-full bg-gradient-salon hover:opacity-90 text-white font-semibold py-3"
          >
            Book Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OfferCard;
