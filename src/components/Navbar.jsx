import React, { useState } from 'react';
import { Menu, X, Home, Users, MapPin, BookOpen, ExternalLink } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuLinks = [
    { label: 'All Stays', href: '#stays', icon: Home },
    { label: 'About Isha', href: '#about', icon: MapPin },
    { label: 'Spiritual Insights', href: '#blogs', icon: BookOpen },
    { label: 'Sadhana Yathra', href: '#community', icon: Users },
    { label: 'Isha Foundation', href: 'https://isha.sadhguru.org', icon: ExternalLink, external: true },
  ];

  const scrollToSection = (href) => {
    setIsMenuOpen(false);
    if (href.startsWith('#')) {
      const id = href.replace('#', '');
      const map = {
        'stays': 0,
        'about': document.querySelector('.bg-white.py-16'),
        'blogs': document.querySelector('.bg-earth-100.py-16'),
        'community': document.querySelector('footer'),
      };
      
      if (id === 'stays') {
        window.scrollTo({ top: 500, behavior: 'smooth' });
      } else if (map[id]) {
        map[id].scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-earth-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-xl font-serif font-bold text-earth-800">Isha Near Stay</span>
            </div>
            
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="https://isha.sadhguru.org" target="_blank" rel="noopener noreferrer" 
                className="text-earth-600 hover:text-earth-900 text-sm font-medium transition-colors flex items-center gap-1">
                Isha Foundation <ExternalLink size={12} />
              </a>
              <a href="https://cottage.isha.in" target="_blank" rel="noopener noreferrer"
                className="text-earth-600 hover:text-earth-900 text-sm font-medium transition-colors flex items-center gap-1">
                Book Cottages <ExternalLink size={12} />
              </a>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-earth-600 hover:bg-earth-50 rounded-full transition-colors"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
      )}
      
      {/* Mobile Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="font-serif font-bold text-earth-800">Menu</span>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-earth-600 hover:bg-earth-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuLinks.map((link, idx) => {
              const IconComponent = link.icon;
              
              if (link.external) {
                return (
                  <a
                    key={idx}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-earth-700 hover:bg-sage-50 hover:text-sage-800 rounded-xl transition-colors"
                  >
                    <IconComponent size={18} />
                    <span className="font-medium">{link.label}</span>
                  </a>
                );
              }
              
              return (
                <button
                  key={idx}
                  onClick={() => scrollToSection(link.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-earth-700 hover:bg-sage-50 hover:text-sage-800 rounded-xl transition-colors"
                >
                  <IconComponent size={18} />
                  <span className="font-medium">{link.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* Community Banner in Menu */}
          <div className="mt-8 p-4 bg-gradient-to-br from-sage-100 to-sage-50 rounded-xl">
            <p className="text-sage-800 text-sm font-medium mb-2">Join our community</p>
            <p className="text-sage-600 text-xs mb-3">Connect with spiritual seekers</p>
            <a 
              href="https://chat.whatsapp.com/I6StiYivCz56B61Nq3e3hG" 
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-sage-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-sage-800 transition-colors"
            >
              Sadhana Yathra
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
