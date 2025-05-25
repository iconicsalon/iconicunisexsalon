
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ServiceCardProps {
  title: string;
  icon: string;
  videoUrl?: string;
  category: 'unisex' | 'male' | 'female';
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  title, 
  icon, 
  videoUrl, 
  category, 
  description 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryBadge = () => {
    switch (category) {
      case 'male':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">👦 Male</Badge>;
      case 'female':
        return <Badge variant="outline" className="text-pink-600 border-pink-600">👩 Female</Badge>;
      case 'unisex':
      default:
        return <Badge variant="outline" className="text-purple-600 border-purple-600">🧑‍🤝‍🧑 Unisex</Badge>;
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden hover-scale cursor-pointer h-80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0 h-full relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-card z-10" />
        
        {/* Video background (shows on hover) */}
        {videoUrl && isHovered && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
        
        {/* Content overlay */}
        <div className="relative z-20 p-6 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-4xl mb-4">{icon}</div>
            {getCategoryBadge()}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-white transition-colors duration-300">
              {title}
            </h3>
            <p className="text-sm text-gray-600 group-hover:text-gray-200 transition-colors duration-300">
              {description}
            </p>
          </div>
        </div>
        
        {/* Animated title overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 transform transition-transform duration-300 z-30 ${
          isHovered ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <h3 className="text-xl font-bold text-white animate-slide-up">
            {title}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
