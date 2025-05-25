
import React from 'react';
import { motion } from 'framer-motion';

type FilterType = 'popular' | 'best-seller' | 'men-women' | 'women-men';

interface OffersFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const OffersFilter: React.FC<OffersFilterProps> = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'popular' as const, label: '🔥 Popular', description: 'Most loved by clients' },
    { id: 'best-seller' as const, label: '⭐ Best Seller', description: 'Top rated combos' },
    { id: 'men-women' as const, label: '👨‍🦱 Men First', description: 'Show men offers first' },
    { id: 'women-men' as const, label: '👩‍🦰 Women First', description: 'Show women offers first' }
  ];

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">Filter Offers</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
              ${activeFilter === filter.id 
                ? 'bg-gradient-salon text-white shadow-lg' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="whitespace-nowrap">{filter.label}</span>
              <span className={`text-xs ${activeFilter === filter.id ? 'text-white/80' : 'text-gray-500'}`}>
                {filter.description}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default OffersFilter;
