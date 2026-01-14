import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StayCard from '../components/StayCard';
import StayModal from '../components/StayModal';
import staysData from '../data/stays.json';
import { Search, Home, Building2, Trees, Hotel, Users, Warehouse } from 'lucide-react';

// Filter category definitions with short names, icons, and images
const filterCategories = [
  { key: 'All', label: 'All Stays', icon: null, image: '/images/category-all.png' },
  { key: 'Inside Isha', label: 'Inside Isha', icon: Home, image: '/images/category-inside-isha.png', matcher: (cat) => cat.includes('Inside Isha') },
  { key: 'Homestay', label: 'Homestay', icon: Home, image: '/images/category-homestay.png', matcher: (cat) => cat.includes('Home Stay') },
  { key: 'Dorms', label: 'Dorms', icon: Users, image: '/images/category-dorm.png', matcher: (cat) => cat.includes('Dorm') },
  { key: 'Hotels', label: 'Hotels', icon: Building2, image: '/images/category-hotel.png', matcher: (cat) => cat.includes('Hotel') || cat.includes('Residenc') },
  { key: 'Farm & Villa', label: 'Farm Stays', icon: Trees, image: '/images/category-farmstay.png', matcher: (cat) => cat.includes('Farm') || cat.includes('Villa') },
  { key: 'Resorts', label: 'Resorts', icon: Hotel, image: '/images/category-resort.png', matcher: (cat) => cat.includes('Resort') && !cat.includes('Farm') },
  { key: 'Halls', label: 'Halls', icon: Warehouse, image: '/images/category-hall.png', matcher: (cat) => cat.includes('Hall') && !cat.includes('Dorm') },
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
    <div className="min-h-screen bg-earth-50">
      <Navbar />
      
      {/* Hero / Header with background image */}
      <div className="relative text-white py-16 px-4 text-center overflow-hidden">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-background.png')" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-earth-900/80 via-earth-900/70 to-earth-900/90" />
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
        {/* Category Filter Cards with Images */}
        <div className="flex gap-3 overflow-x-auto pb-6 mb-4 scrollbar-hide -mx-4 px-4">
          {filterCategories.map(cat => {
            const count = categoryCounts[cat.key] || 0;
            const isActive = filterKey === cat.key;
            
            return (
              <button
                key={cat.key}
                onClick={() => setFilterKey(cat.key)}
                className={`relative min-w-[100px] h-28 rounded-2xl overflow-hidden shrink-0 transition-all ${
                  isActive 
                    ? 'ring-2 ring-sage-500 ring-offset-2 scale-105 shadow-lg' 
                    : 'hover:scale-102 shadow-sm'
                }`}
              >
                {/* Background image or gradient */}
                {cat.image ? (
                  <img 
                    src={cat.image} 
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-sage-500 to-sage-700" />
                )}
                
                {/* Overlay */}
                <div className={`absolute inset-0 ${isActive ? 'bg-black/40' : 'bg-black/50'} transition-colors`} />
                
                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center text-white p-2">
                  <span className="text-sm font-bold whitespace-nowrap drop-shadow-md">{cat.label}</span>
                  <span className="text-xs opacity-80 mt-1">{count} stays</span>
                </div>
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

      {/* About Isha Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-900 mb-4">
            About Isha Yoga Center
          </h2>
          <p className="text-earth-600 leading-relaxed mb-6">
            Nestled at the foothills of the Velliangiri Mountains in Coimbatore, Tamil Nadu, 
            Isha Yoga Center is a powerful space for spiritual seekers. Home to the iconic 
            Adiyogi statue and the consecrated Dhyanalinga, millions visit every year for 
            yoga programs, meditation, and inner transformation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="https://isha.sadhguru.org" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-earth-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-earth-900 transition-colors"
            >
              Visit Isha Foundation
            </a>
            <a 
              href="https://cottage.isha.in" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-sage-100 text-sage-800 px-6 py-3 rounded-full font-semibold hover:bg-sage-200 transition-colors"
            >
              Book Isha Cottages
            </a>
          </div>
        </div>
      </div>

      {/* Blog Preview Section */}
      <div className="bg-earth-100 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-900 mb-2">
              Spiritual Insights
            </h2>
            <p className="text-earth-600">Wisdom for your journey</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Preparing for Your First Isha Visit",
                excerpt: "Everything you need to know before visiting the Isha Yoga Center for the first time.",
                category: "Guide"
              },
              {
                title: "The Significance of Dhyanalinga",
                excerpt: "Understanding the world's only complete, consecrated linga and its spiritual importance.",
                category: "Spirituality"
              },
              {
                title: "Sacred Sites Near Coimbatore",
                excerpt: "Explore the spiritual heritage and ancient temples in the Velliangiri mountain region.",
                category: "Exploration"
              }
            ].map((blog, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs font-semibold text-sage-600 uppercase tracking-wider">{blog.category}</span>
                <h3 className="font-serif font-bold text-earth-900 mt-2 mb-3">{blog.title}</h3>
                <p className="text-earth-600 text-sm line-clamp-2">{blog.excerpt}</p>
                <button className="mt-4 text-sage-700 font-medium text-sm hover:text-sage-800 transition-colors">
                  Coming Soon →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

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
