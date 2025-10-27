import React, { useState, useEffect } from "react";
import { ExternalLink, Globe, Image as ImageIcon, Loader2, Video } from "lucide-react";

// Minimal Google Meet glyph for small badge display
function MeetGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="16" width="32" height="32" rx="6" fill="#1A73E8"/>
      <path d="M40 24l16-8v32l-16-8v-16z" fill="#4285F4"/>
      <path d="M8 24h16v16H8z" fill="#34A853"/>
      <path d="M24 24h16v16H24z" fill="#FBBC05"/>
      <path d="M40 24v16l16-8-16-8z" fill="#EA4335"/>
    </svg>
  );
}

export default function LinkPreview({ url, className = "" }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;
    
    const fetchPreview = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Add https:// if the URL doesn't have a protocol
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        
        // Check if it's a Google Meet link
        if (isGoogleMeetUrl(fullUrl)) {
          setPreview({
            title: "Video meeting",
            subtitle: "Google Meet",
            description: "Join video meeting",
            url: fullUrl,
            hostname: "meet.google.com",
            isGoogleMeet: true
          });
          setLoading(false);
          return;
        }
        
        // Use a CORS proxy to fetch the page metadata
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch preview');
        }
        
        const data = await response.json();
        const html = data.contents;
        
        // Parse HTML to extract metadata
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const title = doc.querySelector('title')?.textContent || 
                     doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                     doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
                     new URL(fullUrl).hostname;
        
        const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                          doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                          doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
                          '';
        
        const image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                     doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
                     doc.querySelector('meta[name="twitter:image:src"]')?.getAttribute('content') ||
                     '';
        
        // Convert relative URLs to absolute
        const absoluteImage = image ? (image.startsWith('http') ? image : new URL(image, fullUrl).href) : '';
        
        setPreview({
          title: title.trim(),
          description: description.trim(),
          image: absoluteImage,
          url: fullUrl,
          hostname: new URL(fullUrl).hostname,
          isGoogleMeet: false
        });
        
      } catch (err) {
        console.error('Link preview error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  const isGoogleMeetUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('meet.google.com');
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className={`mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600">Loading preview...</span>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return null;
  }

  // Special Google Meet preview
  if (preview.isGoogleMeet) {
    return (
      <div className={`mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow max-w-xs ${className}`}>
        <a
          href={preview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          {/* Blue header section */}
          <div className="bg-blue-600 p-3 relative">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <h3 className="font-bold text-sm">{preview.title}</h3>
                <p className="text-xs text-blue-100 mt-1">{preview.subtitle}</p>
              </div>
              <Video className="w-6 h-6 text-blue-200" />
            </div>
          </div>
          
          {/* White bottom section with Meet logo */}
          <div className="bg-white p-3 flex items-center gap-2">
            <div className="flex items-center justify-center">
              <MeetGlyph />
            </div>
            <span className="text-sm text-gray-700 font-medium">{preview.description}</span>
          </div>
        </a>
      </div>
    );
  }

  // Regular preview for other URLs
  return (
    <div className={`mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow max-w-xs ${className}`}>
      <a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        {preview.image && (
          <div className="aspect-video bg-gray-100 overflow-hidden max-h-20">
            <img
              src={preview.image}
              alt={preview.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="p-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-xs line-clamp-1 group-hover:text-blue-600 transition-colors">
                {preview.title}
              </h3>
              
              {preview.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  {preview.description}
                </p>
              )}
              
              <div className="flex items-center gap-1 mt-1">
                <Globe className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 truncate">
                  {preview.hostname}
                </span>
              </div>
            </div>
            
            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
          </div>
        </div>
      </a>
    </div>
  );
}
