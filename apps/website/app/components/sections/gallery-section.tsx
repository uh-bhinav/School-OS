'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [
    {
      src: '/expo-1.jpg',
      alt: 'Team at Expo - Image 1',
      title: 'Expo Experience 1'
    },
    {
      src: '/expo-2.jpg',
      alt: 'Team at Expo - Image 2',
      title: 'Expo Experience 2'
    },
    {
      src: '/expo-3.jpg',
      alt: 'Team at Expo - Image 3',
      title: 'Expo Experience 3'
    },
    {
      src: '/expo-4.jpg',
      alt: 'Team at Expo - Image 4',
      title: 'Expo Experience 4'
    }
  ];

  return (
    <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-32 h-32 sm:w-64 sm:h-64 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-32 h-32 sm:w-64 sm:h-64 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent px-2">
            Gallery
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Highlights from our recent expo - showcasing innovation and collaboration
          </p>
        </div>

        {/* Gallery Grid - Mobile optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl active:scale-95 transition-all duration-300 cursor-pointer aspect-square"
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                priority={index < 2}
              />
              {/* Mobile: Always show overlay, Desktop: on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                  <p className="text-white font-semibold text-xs sm:text-sm truncate">{image.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal - Mobile optimized */}
        {selectedImage !== null && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close button - Mobile friendly */}
            <button
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white text-3xl sm:text-4xl hover:text-gray-300 active:text-gray-400 transition-colors z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/50 rounded-full sm:bg-transparent"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            
            {/* Image container */}
            <div className="relative w-full h-full max-w-5xl max-h-[85vh] sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <Image
                src={images[selectedImage].src}
                alt={images[selectedImage].alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
              
              {/* Image counter for mobile */}
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                {selectedImage + 1} / {images.length}
              </div>
            </div>
            
            {/* Navigation arrows - Mobile optimized */}
            {selectedImage > 0 && (
              <button
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white text-2xl sm:text-4xl hover:text-gray-300 active:text-gray-400 transition-colors bg-black/50 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(selectedImage - 1);
                }}
              >
                ‹
              </button>
            )}
            {selectedImage < images.length - 1 && (
              <button
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white text-2xl sm:text-4xl hover:text-gray-300 active:text-gray-400 transition-colors bg-black/50 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(selectedImage + 1);
                }}
              >
                ›
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
