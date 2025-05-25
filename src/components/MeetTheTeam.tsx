
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio?: string;
}

const MeetTheTeam = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Riya Sharma",
      role: "Senior Stylist",
      image: "/placeholder.svg",
      bio: "5+ years of experience in cutting-edge hair styling and color techniques"
    },
    {
      name: "Aman Verma",
      role: "SPA & Massage Therapist",
      image: "/placeholder.svg",
      bio: "Certified in therapeutic massage and wellness treatments"
    },
    {
      name: "Priya Kapoor",
      role: "Salon Partner",
      image: "/placeholder.svg",
      bio: "Beauty industry veteran with expertise in client relations"
    },
    {
      name: "Rahul Nair",
      role: "Founder & Owner",
      image: "/placeholder.svg",
      bio: "Visionary leader passionate about redefining beauty standards"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our talented professionals are passionate about making you look and feel your best
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Card className="overflow-hidden hover-scale bg-white shadow-lg border-0">
                <CardContent className="p-6 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="relative mb-4"
                  >
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-salon flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-salon opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-salon-purple font-medium mb-3">
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MeetTheTeam;
