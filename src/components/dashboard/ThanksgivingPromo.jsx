import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const BANNER_URL =
  'https://lesson-banners.s3.us-east-1.amazonaws.com/Upcoming_Courses_Banner/Thanksgiving.png';

export default function ThanksgivingPromo() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
        <button
          type="button"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-1.5 text-gray-600 shadow hover:bg-white"
          onClick={() => setIsOpen(false)}
          aria-label="Close announcement"
        >
          <X className="h-5 w-5" />
        </button>
        <img
          src={BANNER_URL}
          alt="Thanksgiving Mega Offer – Join our 1-year masterclass membership"
          className="block w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}
