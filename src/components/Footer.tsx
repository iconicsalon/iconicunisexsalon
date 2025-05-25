
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
    'Makeup Services'
  ];

  const quickLinks = [
    'About Us',
    'Our Services',
    'Book Appointment',
    'Contact',
    'Gallery',
    'Reviews'
  ];

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
