import React, { useEffect, useState } from 'react';
import { getAuthHeader } from '@/services/authHeader';
import { getAccessToken } from '@/services/tokenService';
import BrandKitSection from '@/components/dashboard/BrandKitSection';

const API_URL = 'https://backend-rahul.onrender.com/api/ai-creations';

const formatDate = dateString => {
  if (!dateString) return '';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  } catch (err) {
    return '';
  }
};

export default function AIgenerated() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchImages = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          setError('Missing login token. Please sign in again.');
          return;
        }

        const response = await fetch(API_URL, {
          // Send auth via header and include cookies (if token is stored there)
          credentials: 'include',
          headers: {
            ...getAuthHeader(),
            Accept: 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        const data = await response.json();
        if (isMounted) {
          setImages(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.message ||
              'Unable to load AI creations. Please verify your session and try again.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImages();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            AI Generated Creations
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            User-generated images powered by Athena AI.
          </p>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
              aria-label="Loading"
            />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && images.length === 0 && (
          <div className="rounded-md border border-gray-200 bg-white px-4 py-10 text-center text-gray-600 shadow-sm">
            No AI creations found yet.
          </div>
        )}

        {!loading && !error && images.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                className="group overflow-hidden rounded-xl bg-white shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.url}
                    alt={item.prompt || 'AI generated image'}
                    className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1 px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {item.prompt || 'No prompt provided'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Brand Kits Section */}
        <div className="mt-12">
          <BrandKitSection />
        </div>
      </div>
    </div>
  );
}
