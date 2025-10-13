import React, { useEffect, useRef, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

const carouselItems = [
  // {
  //   id: 0,
  //   type: "video",
  //   videoUrl: "https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/This+Saturday.mp4",
  //   title: "This Saturday",
  //   course: "Upcoming Event",
  //   order: 1
  // },
  {
    id: 1,
    type: "image",
    image: "https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/18oct.png",
    course: "18th Oct",
    
  },
];

export function DashboardCarousel() {
  const nextBtnRef = useRef(null);
  const prevBtnRef = useRef(null);
  const carouselApiRef = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const startAutoAdvance = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (nextBtnRef.current) {
        nextBtnRef.current.click();
      }
    }, 5000);
  };

  const stopAutoAdvance = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoAdvance();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


  return (
    <div className="group relative w-full max-w-4xl mx-auto">
      {/* Section header */}
      <div className="mb-4 px-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Featured</span>
          <span className="text-[11px] text-gray-400">|</span>
          <span className="text-[11px] text-gray-500">Upcoming</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Upcoming Events</h2>
        <p className="text-gray-500 text-sm sm:text-base">Discover what’s events upcoming for you</p>
        <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-emerald-500/40" />
      </div>
      {/* Removed outer decorative border to match banner bounds */}
      
      <Carousel
        opts={{
          align: "center",
          loop: true
        }}
        className="w-full relative z-10 px-1"
        setApi={(api) => {
          carouselApiRef.current = api;
          if (api) {
            api.on('select', () => {
              const newSlide = api.selectedScrollSnap();
              setCurrentSlide(newSlide);
              
              // Check if current slide is a video and restart it
              const currentItem = carouselItems[newSlide];
              if (currentItem && currentItem.type === "video" && videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play();
              }
            });
          }
        }}
      >
        <CarouselContent>
          {carouselItems.map((item, index) => (
            <CarouselItem key={item.id} className="md:basis-full">
              <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-white border border-gray-100">
                <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] bg-white flex items-center justify-center p-2 sm:p-3">
                  {item.type === "video" ? (
                    <video
                      ref={videoRef}
                      src={item.videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="max-w-full max-h-full object-contain transition-all duration-700 select-none rounded-lg"
                      onMouseEnter={(e) => {
                        e.target.muted = false;
                      }}
                      onMouseLeave={(e) => {
                        e.target.muted = true;
                      }}
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt={`${item.title} – ${item.course}`}
                      loading="lazy"
                      draggable={false}
                      className="max-w-full max-h-full object-contain transition-all duration-700 select-none"
                    />
                  )}
                  {/* No text overlays to avoid clashing with banner text */}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Enhanced navigation arrows */}
        <CarouselPrevious
          ref={prevBtnRef}
          className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-full shadow-lg hover:shadow-xl p-3 w-12 h-12 backdrop-blur-sm hover:scale-110"
        />
        <CarouselNext
          ref={nextBtnRef}
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-full shadow-lg hover:shadow-xl p-3 w-12 h-12 backdrop-blur-sm hover:scale-110"
        />

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-blue-600 shadow-lg scale-125'
                  : 'bg-blue-300 hover:bg-blue-400'
              }`}
              onClick={() => {
                if (carouselApiRef.current) {
                  carouselApiRef.current.scrollTo(index);
                }
              }}
            />
          ))}
        </div>

        {/* Removed dark overlays to avoid any grayish background tint */}
      </Carousel>
      
      {/* Subtle bottom accent line */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent rounded-full"></div>
    </div>
  );
}

export default DashboardCarousel;
