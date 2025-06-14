
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { BookingFormData } from '@/hooks/useMultiStepBooking';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';

const serviceCategories = [
  { title: 'Haircut & Styling', emoji: '✂️' },
  { title: 'Hair Coloring / Treatment', emoji: '🎨' },
  { title: 'Facial & Skincare', emoji: '💆‍♀️' },
  { title: 'Waxing', emoji: '🧖‍♀️' },
  { title: 'Manicure & Pedicure', emoji: '💅' },
  { title: 'Makeup Services', emoji: '💄' },
  { title: 'Massage & Relaxation', emoji: '🧘' },
];

interface CategoryStepProps {
  form: UseFormReturn<BookingFormData>;
  onNext: () => void;
  onPrev: () => void;
  watchedCategories: string[];
}

const CategoryStep: React.FC<CategoryStepProps> = ({ 
  form, 
  onNext, 
  onPrev, 
  watchedCategories 
}) => {
  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-800">Select Service Categories</h3>
      <p className="text-sm text-gray-600">Choose the types of services you're interested in</p>
      
      <FormField
        control={form.control}
        name="categories"
        render={() => (
          <FormItem>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {serviceCategories.map((category) => (
                <FormField
                  key={category.title}
                  control={form.control}
                  name="categories"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormControl>
                          <button
                            type="button"
                            onClick={() => {
                              const isSelected = field.value?.includes(category.title);
                              if (isSelected) {
                                field.onChange(
                                  field.value?.filter(value => value !== category.title)
                                );
                              } else {
                                field.onChange([...field.value, category.title]);
                              }
                            }}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                              field.value?.includes(category.title)
                                ? 'border-salon-purple bg-salon-purple/10 text-salon-purple'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{category.emoji}</span>
                              <span className="font-medium">{category.title}</span>
                            </div>
                          </button>
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button 
          type="button" 
          onClick={onNext}
          disabled={watchedCategories.length === 0}
        >
          Next Step <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default CategoryStep;
