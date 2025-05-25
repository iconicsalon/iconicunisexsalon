
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  feedback: string;
  image?: string;
  service: string;
}

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Priya Sharma',
      rating: 5,
      feedback: 'Amazing experience! The hair styling was perfect and the staff was so professional. Highly recommend for anyone looking for quality service.',
      service: 'Hair Styling',
      image: '/images/testimonial1.jpg',
    },
    {
      id: 2,
      name: 'Rahul Kumar',
      rating: 5,
      feedback: 'Best salon in Bengaluru! The haircut was exactly what I wanted and the ambience is great. Will definitely come back.',
      service: 'Haircut',
      image: '/images/testimonial2.jpg',
    },
    {
      id: 3,
      name: 'Anita Reddy',
      rating: 5,
      feedback: 'Loved the facial treatment! My skin feels so fresh and glowing. The therapist was very skilled and gentle.',
      service: 'Facial Treatment',
      image: '/images/testimonial3.jpg',
    },
    {
      id: 4,
      name: 'Vikram Singh',
      rating: 5,
      feedback: 'Professional service and great results. The massage was incredibly relaxing and therapeutic. Five stars!',
      service: 'Massage',
      image: '/images/testimonial4.jpg',
    },
  ];

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isPaused, testimonials.length]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            What Our Clients Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real experiences from our valued customers
          </p>
        </div>

        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                <Card className="max-w-4xl mx-auto">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full bg-gradient-salon flex items-center justify-center text-white text-2xl font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex justify-center md:justify-start mb-2">
                          {renderStars(testimonial.rating)}
                        </div>
                        
                        <p className="text-lg text-gray-700 mb-4 italic">
                          "{testimonial.feedback}"
                        </p>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500">{testimonial.service}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-salon-purple' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
