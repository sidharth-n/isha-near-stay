import React from 'react';
import { Heart, ExternalLink, Instagram, MessageCircle, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-earth-900 text-white">
      {/* Sadhana Yathra Community Banner */}
      <div className="bg-gradient-to-r from-sage-800 via-sage-700 to-sage-800 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users size={24} className="text-sage-200" />
            <span className="text-sage-200 text-sm font-medium uppercase tracking-wider">From the Community</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3">
            Sadhana Yathra
          </h3>
          <p className="text-sage-100 mb-5 max-w-2xl mx-auto">
            A community for spiritual seekers exploring authentic Indian spirituality, sacred places, 
            and timeless wisdom. Join fellow seekers on this beautiful journey.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="https://chat.whatsapp.com/I6StiYivCz56B61Nq3e3hG" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-sage-800 px-6 py-3 rounded-full font-semibold hover:bg-sage-50 transition-colors"
            >
              <MessageCircle size={18} />
              Join WhatsApp Group
            </a>
            <a 
              href="https://instagram.com/sadhana.yathra" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-sage-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-sage-500 transition-colors"
            >
              <Instagram size={18} />
              Follow on Instagram
            </a>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4">Isha Near Stay</h4>
            <p className="text-earth-300 text-sm leading-relaxed">
              A community-driven directory of accommodations near Isha Yoga Center, Coimbatore. 
              Helping seekers find the perfect stay for their spiritual journey.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4">Explore</h4>
            <ul className="space-y-2 text-earth-300 text-sm">
              <li>
                <a href="https://isha.sadhguru.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  Isha Foundation <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://cottage.isha.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  Book Isha Cottages <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.innerengineering.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  Inner Engineering <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4">For Stay Owners</h4>
            <p className="text-earth-300 text-sm mb-3">
              Want to list your property or update your information?
            </p>
            <a 
              href="mailto:contact@sadhanayathra.com" 
              className="inline-flex items-center gap-2 text-sage-400 hover:text-sage-300 transition-colors text-sm"
            >
              <MessageCircle size={14} />
              Contact Us
            </a>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-earth-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-earth-400 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-red-400 fill-red-400" /> by Sadhana Yathra Community
          </p>
          <p className="text-earth-500 text-xs">
            © {new Date().getFullYear()} Isha Near Stay. Not affiliated with Isha Foundation.
          </p>
        </div>
      </div>
    </footer>
  );
}
