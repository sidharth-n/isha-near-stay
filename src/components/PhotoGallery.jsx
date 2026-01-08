import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';

export default function PhotoGallery({ media, stayName, onClose, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter visible media and sort by order
  const visibleMedia = (media || [])
    .filter(m => m.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  if (visibleMedia.length === 0) {
    return null;
  }
  
  const currentMedia = visibleMedia[currentIndex];
  
  const goNext = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev + 1) % visibleMedia.length);
  };
  
  const goPrev = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev - 1 + visibleMedia.length) % visibleMedia.length);
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape' && onClose) onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <h3 className="font-medium truncate">{stayName}</h3>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm">
            {currentIndex + 1} / {visibleMedia.length}
          </span>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative px-4">
        {/* Previous Button */}
        {visibleMedia.length > 1 && (
          <button 
            onClick={goPrev}
            className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
        )}
        
        {/* Media Display */}
        <div className="relative max-w-5xl max-h-[75vh] w-full flex items-center justify-center">
          {currentMedia.type === 'video' ? (
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
              <iframe
                src={currentMedia.url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <img
                src={currentMedia.url}
                alt={`${stayName} - Photo ${currentIndex + 1}`}
                className={`max-h-[75vh] max-w-full object-contain rounded-lg transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                referrerPolicy="no-referrer"
              />
            </>
          )}
        </div>
        
        {/* Next Button */}
        {visibleMedia.length > 1 && (
          <button 
            onClick={goNext}
            className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>
      
      {/* Thumbnail Strip */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-2 justify-center">
          {visibleMedia.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsLoading(true);
                setCurrentIndex(idx);
              }}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                idx === currentIndex 
                  ? 'border-white scale-110' 
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-earth-800 flex items-center justify-center">
                  <Play size={20} className="text-white" />
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
