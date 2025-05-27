
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
  const contactInfo = [
    {
      icon: MapPin,
      label: 'Location',
      value: 'Bengaluru, Karnataka'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+91 XXXXX XXXXX'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@iconicunisexsalon.com'
    },
    {
      icon: Clock,
      label: 'Hours',
      value: 'Mon-Sun: 9 AM - 9 PM'
    }
  ];

  const services = [
    'Hair Cutting & Styling',
    'Hair Coloring',
    'Facials & Skincare',
    'Massage Therapy',
    'Nail Care',
    'Waxing Services'
  ];

  const quickLinks = [
    'About Us',
    'Our Services',
    'Book Appointment',
    'Contact',
    'Gallery',
    'Reviews'
  ];

  const PinterestIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12c.344 0 .688-.014 1.025-.042C12.696 21.851 12.37 19.743 12.73 18.119c.4-1.8 2.632-11.166 2.632-11.166s-.672-1.344-.672-3.33c0-3.118 1.806-5.442 4.056-5.442 1.912 0 2.835 1.434 2.835 3.156 0 1.922-1.224 4.794-1.854 7.458-.528 2.226.336 4.042 2.52 4.042 3.024 0 5.058-3.888 5.058-8.514 0-3.516-2.376-6.156-6.672-6.156-4.86 0-7.884 3.6-7.884 7.632 0 1.386.402 2.364 1.044 3.126.294.36.336.504.228.918-.078.3-.258 1.026-.336 1.314-.102.378-.414.516-.756.378-2.094-.882-3.072-3.234-3.072-5.886 0-4.374 3.672-9.672 10.92-9.672 5.814 0 9.648 4.176 9.648 8.658 0 5.934-3.294 10.404-8.148 10.404-1.632 0-3.168-.888-3.696-1.932 0 0-.84 3.348-1.026 4.056-.306 1.152-1.128 2.604-1.794 3.6C9.75 23.88 10.854 24 12 24c6.626 0 12-5.374 12-12S18.626 0 12 0z"/>
    </svg>
  );

  return (
    <footer className="bg-salon-dark text-white relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-salon-purple/20 to-salon-rose/20 opacity-50"></div>
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold gradient-text mb-4">
                Iconic Unisex Salon
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Transform your look with our premium beauty and wellness services in the heart of Bengaluru.
              </p>
              <div className="flex space-x-4">
                <Button size="sm" variant="outline" className="border-salon-purple text-salon-purple hover:bg-salon-purple hover:text-white">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-salon-gold text-salon-gold hover:bg-salon-gold hover:text-white">
                  <PinterestIcon className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-salon-rose text-salon-rose hover:bg-salon-rose hover:text-white">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-salon-gold">Our Services</h4>
              <ul className="space-y-2">
                {services.map((service) => (
                  <li key={service}>
                    <a href="#" className="text-gray-300 hover:text-salon-purple transition-colors text-sm">
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-salon-gold">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-300 hover:text-salon-purple transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-salon-gold">Contact Info</h4>
              <ul className="space-y-3">
                {contactInfo.map((item) => (
                  <li key={item.label} className="flex items-start space-x-3">
                    <item.icon className="h-4 w-4 text-salon-purple mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</div>
                      <div className="text-sm text-gray-300">{item.value}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <div>
                © 2024 Iconic Unisex Salon. All rights reserved.
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-salon-purple transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-salon-purple transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
