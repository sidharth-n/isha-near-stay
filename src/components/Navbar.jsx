import React from 'react';
import { Menu, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-earth-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-serif font-bold text-earth-800">Isha Stays</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-earth-600 hover:bg-earth-50 rounded-full transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 text-earth-600 hover:bg-earth-50 rounded-full transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
