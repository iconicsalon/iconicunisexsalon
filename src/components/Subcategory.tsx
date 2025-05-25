
import React from 'react';

interface SubcategoryProps {
  title: string;
}

const Subcategory: React.FC<SubcategoryProps> = ({ title }) => {
  return (
    <h3 className="text-lg md:text-xl font-medium text-salon-purple mt-6 mb-4 flex items-center">
      <span className="w-2 h-2 bg-salon-rose rounded-full mr-3"></span>
      {title}
    </h3>
  );
};

export default Subcategory;
