
import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SocialMediaLinks = () => {
  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/iconicunisexsalon',
      color: 'from-pink-500 to-yellow-500',
      hoverColor: 'hover:from-pink-600 hover:to-yellow-600'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: 'https://wa.me/919876543210',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://facebook.com/iconicunisexsalon',
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:to-blue-800'
    },
    {
      name: 'Pinterest',
      icon: function PinterestIcon(props: any) {
        return (
          <svg {...props} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12c.344 0 .688-.014 1.025-.042C12.696 21.851 12.37 19.743 12.73 18.119c.4-1.8 2.632-11.166 2.632-11.166s-.672-1.344-.672-3.33c0-3.118 1.806-5.442 4.056-5.442 1.912 0 2.835 1.434 2.835 3.156 0 1.922-1.224 4.794-1.854 7.458-.528 2.226.336 4.042 2.52 4.042 3.024 0 5.058-3.888 5.058-8.514 0-3.516-2.376-6.156-6.672-6.156-4.86 0-7.884 3.6-7.884 7.632 0 1.386.402 2.364 1.044 3.126.294.36.336.504.228.918-.078.3-.258 1.026-.336 1.314-.102.378-.414.516-.756.378-2.094-.882-3.072-3.234-3.072-5.886 0-4.374 3.672-9.672 10.92-9.672 5.814 0 9.648 4.176 9.648 8.658 0 5.934-3.294 10.404-8.148 10.404-1.632 0-3.168-.888-3.696-1.932 0 0-.84 3.348-1.026 4.056-.306 1.152-1.128 2.604-1.794 3.6C9.75 23.88 10.854 24 12 24c6.626 0 12-5.374 12-12S18.626 0 12 0z"/>
          </svg>
        );
      },
      url: 'https://pinterest.com/iconicunisexsalon',
      color: 'from-red-600 to-red-700',
      hoverColor: 'hover:from-red-700 hover:to-red-800'
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Follow Us</h2>
        <p className="text-gray-600 mb-6">
          Stay connected with us on social media for the latest updates, styling tips, and behind-the-scenes content.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {socialLinks.map((social, index) => (
          <motion.div
            key={social.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Button
              asChild
              className={`w-full h-16 bg-gradient-to-r ${social.color} ${social.hoverColor} text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            >
              <a 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3"
              >
                <social.icon className="h-6 w-6" />
                <span>{social.name}</span>
              </a>
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gradient-to-r from-salon-purple/10 to-salon-rose/10 p-6 rounded-lg"
      >
        <h3 className="font-semibold text-gray-900 mb-2">Quick Contact</h3>
        <p className="text-gray-600 text-sm mb-3">
          For immediate assistance, call us directly:
        </p>
        <Button
          asChild
          variant="outline"
          className="w-full border-salon-purple text-salon-purple hover:bg-salon-purple hover:text-white"
        >
          <a href="tel:+919876543210" className="flex items-center justify-center gap-2">
            <span className="text-lg">📞</span>
            +91 98765 43210
          </a>
        </Button>
      </motion.div>
    </div>
  );
};

export default SocialMediaLinks;
