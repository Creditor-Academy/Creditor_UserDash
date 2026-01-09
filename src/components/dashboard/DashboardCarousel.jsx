import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { SeasonalThemeContext } from '@/contexts/SeasonalThemeContext';

const carouselItems = [
  // {
  //   id: 0,
  //   type: "video",
  //   videoUrl: "https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/This+Saturday.mp4",
  //   title: "This Saturday",
  //   course: "Upcoming Event",
  //   order: 1
  // },
  // {
  //   id: 1,
  //   type: 'image',
  //   image:
  //     'https://lesson-banners.s3.us-east-1.amazonaws.com/Upcoming_Courses_Banner/saturday+event.png',
  //   title: 'This Saturday',
  //   course: '8th Nov',
  // },
  {
    id: 2,
    type: 'image',
    image:
      '',
    title: 'Upcoming Event',
    course: 'Banner 2',
  },
  {
    id: 3,
    type: 'image',
    image:
      '',
    title: 'Upcoming Event',
    course: 'Banner 3',
  },
];

export function DashboardCarousel() {
  const nextBtnRef = useRef(null);
  const prevBtnRef = useRef(null);
  const carouselApiRef = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { activeTheme } = useContext(SeasonalThemeContext);
  const isNewYear = activeTheme === 'newYear';

  const startAutoAdvance = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (nextBtnRef.current) {
        nextBtnRef.current.click();
      }
    }, 6000);
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
    <div
      className={`group relative w-full max-w-4xl mx-auto ${
        isNewYear ? 'ny-upcoming-events' : ''
      }`}
    >
      {/* Section header */}
      <div className={`mb-4 px-1 ${isNewYear ? 'ny-upcoming-header' : ''}`}>
        {isNewYear && (
          <div className="ny-crackers" aria-hidden="true">
            <span className="ny-burst ny-burst-a" />
            <span className="ny-burst ny-burst-b" />
            <span className="ny-burst ny-burst-c" />
          </div>
        )}
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              isNewYear
                ? 'bg-white/85 text-indigo-700 border-indigo-200 shadow-sm'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            Featured
          </span>
          <span className="text-[11px] text-gray-400">|</span>
          <span
            className={`text-[11px] ${isNewYear ? 'text-indigo-700/80' : 'text-gray-500'}`}
          >
            Upcoming
          </span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-bold leading-tight ${
            isNewYear ? 'ny-title' : 'text-gray-900'
          }`}
        >
          Upcoming Events
        </h2>
        <p
          className={`text-sm sm:text-base ${isNewYear ? 'text-indigo-700/70' : 'text-gray-500'}`}
        >
          Discover what’s events upcoming for you
        </p>
        <div
          className={`mt-2 h-1 w-24 rounded-full ${
            isNewYear
              ? 'bg-gradient-to-r from-blue-600/50 via-indigo-600/45 to-yellow-500/45'
              : 'bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-emerald-500/40'
          }`}
        />
      </div>
      {/* Removed outer decorative border to match banner bounds */}

      <Carousel
        opts={{
          align: 'center',
          loop: true,
          // Slow down the embla scroll animation for a smoother feel
          duration: 40,
        }}
        className="w-full relative z-10 px-1"
        setApi={api => {
          carouselApiRef.current = api;
          if (api) {
            api.on('select', () => {
              const newSlide = api.selectedScrollSnap();
              setCurrentSlide(newSlide);

              // Check if current slide is a video and restart it
              const currentItem = carouselItems[newSlide];
              if (
                currentItem &&
                currentItem.type === 'video' &&
                videoRef.current
              ) {
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
                  {item.type === 'video' ? (
                    <video
                      ref={videoRef}
                      src={item.videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="max-w-full max-h-full object-contain transition-all duration-700 select-none rounded-lg"
                      onMouseEnter={e => {
                        e.target.muted = false;
                      }}
                      onMouseLeave={e => {
                        e.target.muted = true;
                      }}
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt={
                        item.title
                          ? `${item.title} – ${item.course || ''}`.trim()
                          : item.course || 'Banner'
                      }
                      loading="lazy"
                      draggable={false}
                      referrerPolicy="no-referrer"
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

      {isNewYear && (
        <style>{`
          .ny-upcoming-events {
            isolation: isolate;
          }

          .ny-upcoming-header {
            position: relative;
            border-radius: 14px;
            padding-top: 10px;
            padding-bottom: 10px;
          }

          .ny-upcoming-header::before {
            content: '';
            position: absolute;
            inset: -6px -10px;
            border-radius: 18px;
            pointer-events: none;
            background:
              radial-gradient(700px 220px at 20% 0%, rgba(59, 130, 246, 0.20) 0%, transparent 60%),
              radial-gradient(640px 220px at 80% 0%, rgba(99, 102, 241, 0.18) 0%, transparent 60%),
              radial-gradient(420px 160px at 50% 0%, rgba(234, 179, 8, 0.12) 0%, transparent 70%);
            opacity: 0.95;
            z-index: 0;
          }

          .ny-upcoming-header > * {
            position: relative;
            z-index: 1;
          }

          .ny-title {
            background: linear-gradient(90deg, rgba(30, 64, 175, 1), rgba(79, 70, 229, 1), rgba(234, 179, 8, 1));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .ny-crackers {
            position: absolute;
            inset: -10px -6px auto -6px;
            height: 64px;
            pointer-events: none;
            z-index: 2;
          }

          .ny-burst {
            position: absolute;
            width: 70px;
            height: 70px;
            border-radius: 9999px;
            opacity: 0;
            filter: drop-shadow(0 12px 18px rgba(2, 6, 23, 0.18));
            background:
              radial-gradient(circle, rgba(255,255,255,0.95) 0 6px, transparent 7px),
              conic-gradient(
                from 0deg,
                rgba(59,130,246,0.85),
                rgba(99,102,241,0.85),
                rgba(234,179,8,0.85),
                rgba(244,63,94,0.80),
                rgba(59,130,246,0.85)
              );
            mask:
              radial-gradient(circle, transparent 0 18px, #000 19px 20px, transparent 21px),
              radial-gradient(circle, #000 0 60%, transparent 61%);
            -webkit-mask:
              radial-gradient(circle, transparent 0 18px, #000 19px 20px, transparent 21px),
              radial-gradient(circle, #000 0 60%, transparent 61%);
          }

          .ny-burst::after {
            content: '';
            position: absolute;
            inset: 6px;
            border-radius: 9999px;
            background:
              radial-gradient(circle at 18% 22%, rgba(255,255,255,0.85) 0 1.3px, transparent 1.4px),
              radial-gradient(circle at 70% 20%, rgba(255,255,255,0.70) 0 1.1px, transparent 1.2px),
              radial-gradient(circle at 34% 78%, rgba(255,255,255,0.75) 0 1.2px, transparent 1.3px),
              radial-gradient(circle at 82% 72%, rgba(255,255,255,0.65) 0 1.1px, transparent 1.2px);
            opacity: 0.85;
          }

          .ny-burst-a { left: -6px; top: -6px; transform: scale(0.7); animation: ny-burst 2.7s ease-in-out infinite; }
          .ny-burst-b { left: 42%; top: -14px; transform: scale(0.55); animation: ny-burst 3.1s ease-in-out infinite 0.45s; }
          .ny-burst-c { right: -10px; top: -8px; transform: scale(0.65); animation: ny-burst 2.9s ease-in-out infinite 0.2s; }

          @keyframes ny-burst {
            0% { opacity: 0; transform: translateY(10px) scale(0.35) rotate(0deg); }
            12% { opacity: 0.95; }
            35% { opacity: 0.95; transform: translateY(0) scale(0.75) rotate(18deg); }
            55% { opacity: 0.55; transform: translateY(-3px) scale(0.82) rotate(28deg); }
            100% { opacity: 0; transform: translateY(-10px) scale(0.9) rotate(40deg); }
          }

          @media (prefers-reduced-motion: reduce) {
            .ny-burst-a, .ny-burst-b, .ny-burst-c {
              animation: none !important;
              opacity: 0.25;
            }
          }
        `}</style>
      )}
    </div>
  );
}

export default DashboardCarousel;
