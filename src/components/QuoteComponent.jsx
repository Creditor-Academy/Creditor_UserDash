import React, { useState, useEffect } from 'react';
import { Quote, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const QuoteComponent = ({
  showQuoteTemplateSidebar,
  setShowQuoteTemplateSidebar,
  showQuoteEditDialog,
  setShowQuoteEditDialog,
  onQuoteTemplateSelect,
  onQuoteUpdate,
  editingQuoteBlock
}) => {
  // Quote editing state
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');

  // Setup global carousel functions
  useEffect(() => {
    // Global carousel navigation functions
    window.carouselPrev = (button) => {
      const carousel = button.closest('[class*="quote-carousel"]');
      if (!carousel) return;
      
      const slides = carousel.querySelectorAll('.quote-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      let currentIndex = parseInt(carousel.dataset.current || '0');
      
      const newIndex = currentIndex > 0 ? currentIndex - 1 : slides.length - 1;
      showCarouselSlide(carousel, slides, dots, newIndex);
    };

    window.carouselNext = (button) => {
      const carousel = button.closest('[class*="quote-carousel"]');
      if (!carousel) return;
      
      const slides = carousel.querySelectorAll('.quote-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      let currentIndex = parseInt(carousel.dataset.current || '0');
      
      const newIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
      showCarouselSlide(carousel, slides, dots, newIndex);
    };

    window.carouselGoTo = (button, index) => {
      const carousel = button.closest('[class*="quote-carousel"]');
      if (!carousel) return;
      
      const slides = carousel.querySelectorAll('.quote-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      
      showCarouselSlide(carousel, slides, dots, index);
    };

    const showCarouselSlide = (carousel, slides, dots, index) => {
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.remove('hidden');
          slide.classList.add('block');
        } else {
          slide.classList.remove('block');
          slide.classList.add('hidden');
        }
      });
      
      dots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.remove('bg-gray-300');
          dot.classList.add('bg-purple-500');
        } else {
          dot.classList.remove('bg-purple-500');
          dot.classList.add('bg-gray-300');
        }
      });
      
      carousel.dataset.current = index.toString();
    };

    return () => {
      // Cleanup global functions when component unmounts
      delete window.carouselPrev;
      delete window.carouselNext;
      delete window.carouselGoTo;
    };
  }, []);

  // Quote templates
  const quoteTemplates = [
    {
      id: 'quote_a',
      title: 'Quote A',
      description: 'Simple quote with author attribution and image',
      icon: <Quote className="h-6 w-6" />,
      defaultContent: {
        quote: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&h=687&q=80",
        backgroundImage: ""
      }
    },
    {
      id: 'quote_b',
      title: 'Quote B',
      description: 'Quote with author image and styled layout',
      icon: <Quote className="h-6 w-6" />,
      defaultContent: {
        quote: "It is during our darkest moments that we must focus to see the light.",
        author: "Aristotle",
        authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&h=687&q=80",
        backgroundImage: ""
      }
    },
    {
      id: 'quote_c',
      title: 'Quote C',
      description: 'Quote with large author image and modern styling',
      icon: <Quote className="h-6 w-6" />,
      defaultContent: {
        quote: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&h=1170&q=80",
        backgroundImage: ""
      }
    },
    {
      id: 'quote_d',
      title: 'Quote D',
      description: 'Compact quote with minimal styling and border accent',
      icon: <Quote className="h-6 w-6" />,
      defaultContent: {
        quote: "Life is what happens to you while you're busy making other plans.",
        author: "John Lennon",
        authorImage: "",
        backgroundImage: ""
      }
    },
    {
      id: 'quote_on_image',
      title: 'Quote on Image',
      description: 'Quote overlay on a background image with gradient',
      icon: <Quote className="h-6 w-6" />,
      defaultContent: {
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        authorImage: "",
        backgroundImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
      }
    },
    {
      id: 'quote_carousel',
      title: 'Quote Carousel',
      description: 'Multiple quotes in an interactive carousel format',
      icon: <Quote className="h-6 w-6" />,
      defaultContent: {
        quotes: [
          {
            quote: "The future belongs to those who believe in the beauty of their dreams.",
            author: "Eleanor Roosevelt"
          },
          {
            quote: "It is during our darkest moments that we must focus to see the light.",
            author: "Aristotle"
          },
          {
            quote: "The way to get started is to quit talking and begin doing.",
            author: "Walt Disney"
          }
        ]
      }
    }
  ];

  // Initialize quote editing state when dialog opens
  React.useEffect(() => {
    if (showQuoteEditDialog && editingQuoteBlock) {
      try {
        const quoteContent = JSON.parse(editingQuoteBlock.content || '{}');
        setQuoteText(quoteContent.quote || '');
        setQuoteAuthor(quoteContent.author || '');
      } catch (error) {
        // Fallback for malformed JSON
        setQuoteText('');
        setQuoteAuthor('');
      }
    }
  }, [showQuoteEditDialog, editingQuoteBlock]);

  const handleQuoteTemplateSelect = (template) => {
    let htmlContent = '';
    const content = template.defaultContent;

    switch (template.id) {
      case 'quote_a':
        htmlContent = `
          <div class="relative bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-2xl mx-auto">
            <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-2xl"></div>
            <div class="pl-6">
              <div class="flex items-start space-x-4">
                <div class="flex-1">
                  <blockquote class="text-xl italic text-gray-700 mb-4 leading-relaxed">
                    "${content.quote}"
                  </blockquote>
                  <div class="flex items-center space-x-3">
                    <cite class="text-lg font-semibold text-gray-600 not-italic">— ${content.author}</cite>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 'quote_b':
        htmlContent = `
          <div class="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl p-10 border border-gray-200 max-w-3xl mx-auto">
            <div class="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-r-3xl"></div>
            <div class="pr-6">
              <div class="text-center">
                <blockquote class="text-2xl italic text-gray-800 mb-6 leading-relaxed font-light">
                  "${content.quote}"
                </blockquote>
                <cite class="text-xl font-bold text-gray-700 not-italic">— ${content.author}</cite>
              </div>
            </div>
          </div>
        `;
        break;

      case 'quote_c':
        htmlContent = `
          <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
            <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
            <div class="p-12">
              <div class="text-center">
                <blockquote class="text-3xl italic text-gray-700 mb-6 leading-relaxed font-light">
                  "${content.quote}"
                </blockquote>
                <cite class="text-2xl font-bold text-gray-600 not-italic">— ${content.author}</cite>
              </div>
            </div>
          </div>
        `;
        break;

      case 'quote_d':
        htmlContent = `
          <div class="relative bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 max-w-2xl mx-auto">
            <blockquote class="text-lg italic text-gray-700 mb-3 leading-relaxed">
              "${content.quote}"
            </blockquote>
            <cite class="text-base font-medium text-indigo-600 not-italic">— ${content.author}</cite>
          </div>
        `;
        break;

      case 'quote_on_image':
        htmlContent = `
          <div class="relative rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto" style="background-image: url('${content.backgroundImage}'); background-size: cover; background-position: center; min-height: 400px;">
            <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
            <div class="relative z-10 flex items-center justify-center h-full p-12">
              <div class="text-center text-white">
                <blockquote class="text-4xl italic mb-6 leading-relaxed font-light">
                  "${content.quote}"
                </blockquote>
                <cite class="text-2xl font-semibold not-italic">— ${content.author}</cite>
              </div>
            </div>
          </div>
        `;
        break;

      case 'quote_carousel':
        htmlContent = `
          <div class="relative bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto">
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-3xl"></div>
            <div class="quote-carousel-${Date.now()}" data-current="0">
              ${content.quotes.map((q, index) => `
                <div class="quote-slide ${index === 0 ? 'block' : 'hidden'}" data-index="${index}">
                  <div class="text-center py-8">
                    <blockquote class="text-3xl italic text-gray-800 mb-6 leading-relaxed font-light">
                      "${q.quote}"
                    </blockquote>
                    <cite class="text-xl font-bold text-gray-600 not-italic">— ${q.author}</cite>
                  </div>
                </div>
              `).join('')}
              <div class="flex justify-center items-center space-x-4 mt-8">
                <button onclick="window.carouselPrev && window.carouselPrev(this)" class="carousel-prev bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <div class="flex space-x-2">
                  ${content.quotes.map((_, index) => `
                    <button onclick="window.carouselGoTo && window.carouselGoTo(this, ${index})" class="carousel-dot w-3 h-3 rounded-full transition-colors ${index === 0 ? 'bg-purple-500' : 'bg-gray-300'}" data-index="${index}"></button>
                  `).join('')}
                </div>
                <button onclick="window.carouselNext && window.carouselNext(this)" class="carousel-next bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
        break;

      default:
        htmlContent = `
          <div class="relative bg-white rounded-2xl shadow-md p-6 border">
            <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
            <div class="pl-4">
              <blockquote class="text-lg italic text-gray-700 mb-3">
                "${content.quote}"
              </blockquote>
              <cite class="text-sm font-medium text-gray-500">— ${content.author}</cite>
            </div>
          </div>
        `;
    }

    const newBlock = {
      id: `block_${Date.now()}`,
      type: 'quote',
      content: JSON.stringify(content),
      html_css: htmlContent,
      details: {
        quote: content.quote || content.quotes?.[0]?.quote || '',
        author: content.author || content.quotes?.[0]?.author || '',
        authorImage: content.authorImage || '',
        backgroundImage: content.backgroundImage || '',
        templateId: template.id
      }
    };

    onQuoteTemplateSelect(newBlock);
    setShowQuoteTemplateSidebar(false);
  };

  const handleQuoteUpdate = () => {
    if (!editingQuoteBlock) return;

    const updatedQuoteContent = {
      quote: quoteText,
      author: quoteAuthor
    };

    onQuoteUpdate(editingQuoteBlock, updatedQuoteContent);
    
    // Close dialog and reset state
    setShowQuoteEditDialog(false);
    setQuoteText('');
    setQuoteAuthor('');
    
    toast.success('Quote updated successfully!');
  };

  return (
    <>
      {/* Quote Template Sidebar */}
      {showQuoteTemplateSidebar && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
            onClick={() => setShowQuoteTemplateSidebar(false)}
          />
          
          {/* Sidebar */}
          <div className="relative bg-white w-96 h-full shadow-xl overflow-y-auto animate-slide-in-left">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Quote Templates</h2>
              <button
                onClick={() => setShowQuoteTemplateSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {quoteTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleQuoteTemplateSelect(template)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          {template.title}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {template.description}
                        </p>
                        
                        {/* Preview */}
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <div className="text-xs italic text-gray-600 mb-1">
                            "{template.defaultContent.quote || template.defaultContent.quotes?.[0]?.quote || 'Sample quote'}"
                          </div>
                          <div className="text-xs text-gray-500">
                            — {template.defaultContent.author || template.defaultContent.quotes?.[0]?.author || 'Author'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Edit Dialog */}
      <Dialog open={showQuoteEditDialog} onOpenChange={setShowQuoteEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the quote text..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={quoteAuthor}
                onChange={(e) => setQuoteAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter author name..."
                required
              />
            </div>


            {/* Preview */}
            {(quoteText || quoteAuthor) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="relative bg-white rounded-2xl shadow-md p-6 border">
                  <div className="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
                  <div className="pl-4">
                    <blockquote className="text-lg italic text-gray-700 mb-3">
                      "{quoteText || 'Your quote text will appear here...'}"
                    </blockquote>
                    <cite className="text-sm font-medium text-gray-500">
                      — {quoteAuthor || 'Author name'}
                    </cite>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuoteEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleQuoteUpdate}
              disabled={!quoteText.trim() || !quoteAuthor.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuoteComponent;
