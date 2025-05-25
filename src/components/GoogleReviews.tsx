
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin } from 'lucide-react';

interface GoogleReview {
  id: number;
  reviewerName: string;
  reviewerPhoto?: string;
  rating: number;
  reviewText: string;
  timeAgo: string;
}

const GoogleReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock Google Reviews - In production, these would be fetched from Google Places API
  const reviews: GoogleReview[] = [
    {
      id: 1,
      reviewerName: 'Sneha Patel',
      rating: 5,
      reviewText: 'Excellent service and very professional staff. The salon is clean and well-maintained. Highly recommend their hair coloring services!',
      timeAgo: '2 weeks ago',
    },
    {
      id: 2,
      reviewerName: 'Arjun Nair',
      rating: 5,
      reviewText: 'Best salon experience in Bengaluru! The staff is friendly and skilled. Got an amazing haircut here.',
      timeAgo: '1 month ago',
    },
    {
      id: 3,
      reviewerName: 'Kavya Menon',
      rating: 5,
      reviewText: 'Loved the facial treatment! Very relaxing and my skin looks amazing. Will definitely visit again.',
      timeAgo: '3 weeks ago',
    },
    {
      id: 4,
      reviewerName: 'Ravi Krishnan',
      rating: 4,
      reviewText: 'Good service and clean environment. The massage was very therapeutic and relaxing.',
      timeAgo: '1 week ago',
    },
    {
      id: 5,
      reviewerName: 'Divya Iyer',
      rating: 5,
      reviewText: 'Amazing makeup service for my wedding! The team was professional and made me look gorgeous.',
      timeAgo: '2 months ago',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews.length]);

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

  const getVisibleReviews = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % reviews.length;
      visible.push(reviews[index]);
    }
    return visible;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/images/google-logo.png" 
              alt="Google" 
              className="h-8 w-8"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h2 className="text-3xl md:text-4xl font-bold gradient-text">
              Google Reviews
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex">
              {renderStars(5)}
            </div>
            <span className="text-lg font-semibold">4.8 out of 5</span>
            <span className="text-gray-500">({reviews.length}+ reviews)</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Bengaluru, Karnataka</span>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisibleReviews().map((review, index) => (
              <Card 
                key={`${review.id}-${currentIndex}`} 
                className="h-full animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-salon flex items-center justify-center text-white font-bold">
                      {review.reviewerName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {review.reviewerName}
                      </h4>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">{review.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 line-clamp-3">
                    {review.reviewText}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-salon-purple' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-salon-purple hover:text-salon-rose transition-colors font-medium"
          >
            <img 
              src="/images/google-logo.png" 
              alt="Google" 
              className="h-5 w-5"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            View all reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
