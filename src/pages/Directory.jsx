import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import StayCard from '../components/StayCard';
import StayModal from '../components/StayModal';
import staysData from '../data/stays.json';
import { Search, Home, Building2, Trees, Hotel, Users, Warehouse } from 'lucide-react';

// Filter category definitions with short names and icons
const filterCategories = [
  { key: 'All', label: 'All', icon: null },
  { key: 'Inside Isha', label: 'Inside Isha', icon: Home, matcher: (cat) => cat.includes('Inside Isha') },
  { key: 'Homestay', label: 'Homestay', icon: Home, matcher: (cat) => cat.includes('Home Stay') },
  { key: 'Dorms', label: 'Dorms', icon: Users, matcher: (cat) => cat.includes('Dorm') },
  { key: 'Hotels', label: 'Hotels', icon: Building2, matcher: (cat) => cat.includes('Hotel') || cat.includes('Residenc') },
  { key: 'Farm & Villa', label: 'Farm Stays', icon: Trees, matcher: (cat) => cat.includes('Farm') || cat.includes('Villa') },
  { key: 'Resorts', label: 'Resorts', icon: Hotel, matcher: (cat) => cat.includes('Resort') && !cat.includes('Farm') },
  { key: 'Halls', label: 'Halls', icon: Warehouse, matcher: (cat) => cat.includes('Hall') && !cat.includes('Dorm') },
];

export default function Directory() {
  const [selectedStay, setSelectedStay] = useState(null);
  const [filterKey, setFilterKey] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stays
  const filteredStays = useMemo(() => {
    const activeFilter = filterCategories.find(f => f.key === filterKey);
    
    return staysData.filter(stay => {
      // Category filter
      const matchesCategory = filterKey === 'All' || 
        (activeFilter?.matcher && activeFilter.matcher(stay.category));
      
      // Search filter
      const matchesSearch = searchQuery === '' || 
        stay.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        stay.distance.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (stay.address && stay.address.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [filterKey, searchQuery]);
  
  // Count stays per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    filterCategories.forEach(cat => {
      if (cat.key === 'All') {
        counts[cat.key] = staysData.length;
      } else if (cat.matcher) {
        counts[cat.key] = staysData.filter(stay => cat.matcher(stay.category)).length;
      }
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-earth-50 pb-20">
      <Navbar />
      
      {/* Hero / Header */}
      <div className="bg-gradient-to-br from-earth-800 via-earth-900 to-earth-800 text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Find Your Stay Near Isha
          </h1>
          <p className="text-earth-200 text-lg mb-8 max-w-xl mx-auto">
            A curated directory of accommodations near Isha Yoga Center, Coimbatore.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or distance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3.5 pl-12 pr-6 rounded-full text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-sage-400 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter Cards */}
        <div className="flex gap-3 overflow-x-auto pb-6 mb-4 scrollbar-hide -mx-4 px-4">
          {filterCategories.map(cat => {
            const IconComponent = cat.icon;
            const count = categoryCounts[cat.key] || 0;
            const isActive = filterKey === cat.key;
            
            return (
              <button
                key={cat.key}
                onClick={() => setFilterKey(cat.key)}
                className={`flex flex-col items-center gap-2 min-w-[80px] px-4 py-3 rounded-2xl text-center transition-all shrink-0 ${
                  isActive 
                    ? 'bg-earth-800 text-white shadow-lg scale-105' 
                    : 'bg-white text-earth-600 hover:bg-earth-100 border border-earth-200 hover:border-earth-300'
                }`}
              >
                {IconComponent && (
                  <IconComponent size={22} className={isActive ? 'text-sage-300' : 'text-earth-400'} />
                )}
                <span className="text-sm font-semibold whitespace-nowrap">{cat.label}</span>
                <span className={`text-xs ${isActive ? 'text-earth-300' : 'text-earth-400'}`}>
                  {count} stays
                </span>
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-earth-600">
            Showing <span className="font-semibold text-earth-800">{filteredStays.length}</span> stays
            {filterKey !== 'All' && (
              <span> in <span className="font-semibold text-sage-700">{filterKey}</span></span>
            )}
          </p>
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
              onClick={() => {setFilterKey('All'); setSearchQuery('');}}
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
