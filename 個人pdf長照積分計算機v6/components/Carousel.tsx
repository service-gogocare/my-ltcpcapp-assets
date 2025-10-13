import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CarouselProps {
  children: React.ReactNode;
}

export const Carousel: React.FC<CarouselProps> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = React.Children.toArray(children);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="relative w-full group">
      {/* Carousel wrapper */}
      <div className="relative overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="flex-shrink-0 w-full">
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Slider controls */}
      <button
        type="button"
        className="absolute top-1/2 left-2 -translate-y-1/2 z-30 flex items-center justify-center h-10 w-10 rounded-full bg-white/50 dark:bg-black/30 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-white" />
      </button>
      <button
        type="button"
        className="absolute top-1/2 right-2 -translate-y-1/2 z-30 flex items-center justify-center h-10 w-10 rounded-full bg-white/50 dark:bg-black/30 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-white" />
      </button>

      {/* Slider indicators */}
      <div className="absolute z-30 flex space-x-2 -translate-x-1/2 bottom-4 left-1/2">
        {slides.map((_, slideIndex) => (
          <button
            key={slideIndex}
            type="button"
            className={`w-3 h-3 rounded-full transition-colors ${
              currentIndex === slideIndex ? 'bg-brand-secondary' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-current={currentIndex === slideIndex}
            aria-label={`Go to slide ${slideIndex + 1}`}
            onClick={() => goToSlide(slideIndex)}
          ></button>
        ))}
      </div>
    </div>
  );
};