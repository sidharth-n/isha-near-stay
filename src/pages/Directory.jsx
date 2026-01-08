import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import StayCard from '../components/StayCard';
import StayModal from '../components/StayModal';
import staysData from '../data/stays.json';
import { Filter } from 'lucide-react';

export default function Directory() {
  const [selectedStay, setSelectedStay] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(staysData.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, []);

  // Filter stays
  const filteredStays = useMemo(() => {
    return staysData.filter(stay => {
      const matchesCategory = filterCategory === 'All' || stay.category === filterCategory;
      const matchesSearch = stay.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stay.distance.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filterCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-earth-50 pb-20">
      <Navbar />
      
      {/* Hero / Header */}
      <div className="bg-earth-800 text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Find Your Stay Near Isha
          </h1>
          <p className="text-earth-200 text-lg mb-8 max-w-xl mx-auto">
            A curated directory of accommodations, homestays, and hotels near Isha Yoga Center, Coimbatore.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search by name or distance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 px-6 rounded-full text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-sage-400 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <div className="flex items-center gap-2 text-earth-600 font-medium shrink-0 mr-2">
            <Filter size={18} />
            <span>Filters:</span>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterCategory === cat 
                  ? 'bg-earth-800 text-white shadow-md' 
                  : 'bg-white text-earth-600 hover:bg-earth-100 border border-earth-200'
              }`}
            >
              {cat.split('(')[0].trim()}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStays.map(stay => (
            <StayCard 
              key={stay.id} 
              stay={stay} 
              onClick={() => setSelectedStay(stay)}
            />
          ))}
        </div>

        {filteredStays.length === 0 && (
          <div className="text-center py-20">
            <p className="text-earth-500 text-lg">No stays found matching your criteria.</p>
            <button 
              onClick={() => {setFilterCategory('All'); setSearchQuery('');}}
              className="mt-4 text-sage-600 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedStay && (
        <StayModal 
          stay={selectedStay} 
          onClose={() => setSelectedStay(null)} 
        />
      )}
    </div>
  );
}
