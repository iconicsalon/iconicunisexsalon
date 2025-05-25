
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Service {
  name: string;
  gender: 'male' | 'female' | 'unisex';
}

interface ServiceItemProps {
  service: Service;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ service }) => {
  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      case 'unisex':
        return '⚧️';
      default:
        return '⚧️';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'border-blue-200 hover:border-blue-400 hover:bg-blue-50';
      case 'female':
        return 'border-pink-200 hover:border-pink-400 hover:bg-pink-50';
      case 'unisex':
        return 'border-purple-200 hover:border-purple-400 hover:bg-purple-50';
      default:
        return 'border-gray-200 hover:border-gray-400 hover:bg-gray-50';
    }
  };

  return (
    <Card 
      className={`transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer ${getGenderColor(service.gender)}`}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-base font-medium text-gray-800 truncate">
              {service.name}
            </p>
          </div>
          <div className="ml-2 text-lg">
            {getGenderIcon(service.gender)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceItem;
