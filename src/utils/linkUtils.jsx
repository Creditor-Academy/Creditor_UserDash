import React from 'react';
import LinkPreview from '@/components/group/LinkPreview';

// Utility functions for detecting and rendering URLs in text

// URL regex pattern that matches most common URL formats
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;

// Function to detect URLs in text
export const detectUrls = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const urls = [];
  let match;
  
  while ((match = URL_REGEX.exec(text)) !== null) {
    urls.push({
      url: match[0],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  return urls;
};

// Function to render text with clickable links and previews
export const renderTextWithLinks = (text, className = '', showPreview = true) => {
  if (!text || typeof text !== 'string') return text;
  
  const urls = detectUrls(text);
  
  if (urls.length === 0) {
    return <span className={className}>{text}</span>;
  }
  
  const parts = [];
  let lastIndex = 0;
  
  urls.forEach((urlInfo, index) => {
    // Add text before the URL
    if (urlInfo.start > lastIndex) {
      parts.push(
        <span key={`text-${index}`} className={className}>
          {text.slice(lastIndex, urlInfo.start)}
        </span>
      );
    }
    
    // Add the clickable URL
    const fullUrl = urlInfo.url.startsWith('http') ? urlInfo.url : `https://${urlInfo.url}`;
    parts.push(
      <a
        key={`link-${index}`}
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} font-bold hover:underline transition-colors`}
      >
        {urlInfo.url}
      </a>
    );
    
    lastIndex = urlInfo.end;
  });
  
  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end" className={className}>
        {text.slice(lastIndex)}
      </span>
    );
  }
  
  // Add link previews if enabled
  if (showPreview && urls.length > 0) {
    urls.forEach((urlInfo, index) => {
      parts.push(
        <LinkPreview 
          key={`preview-${index}`} 
          url={urlInfo.url} 
          className="mt-2"
        />
      );
    });
  }
  
  return parts;
};

// Function to check if text contains URLs
export const hasUrls = (text) => {
  return detectUrls(text).length > 0;
};
