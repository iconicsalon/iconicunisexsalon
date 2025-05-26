
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Replace this URL with your actual Google Form URL
      const googleFormUrl = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
      
      // Create form data for Google Forms
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('entry.NAME_FIELD_ID', formData.name);
      formDataToSubmit.append('entry.EMAIL_FIELD_ID', formData.email);
      formDataToSubmit.append('entry.MESSAGE_FIELD_ID', formData.message);

      // Submit to Google Form
      await fetch(googleFormUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formDataToSubmit
      });

      // Show success message
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Send us a Message</h2>
        <p className="text-gray-600 mb-6">
          Have a question about our services? We'd love to hear from you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="w-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <Textarea
            id="message"
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us about your inquiry..."
            rows={5}
            className="w-full resize-none"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-salon hover:opacity-90 text-white font-semibold py-3 transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-gray-50 p-4 rounded-lg"
      >
        <h3 className="font-semibold text-gray-900 mb-2">Visit Our Salon</h3>
        <p className="text-gray-600 text-sm">
          📍 123 Beauty Street, Koramangala<br />
          Bengaluru, Karnataka 560034<br />
          ⏰ Open: 10:00 AM - 8:00 PM (All days)
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ContactForm;
