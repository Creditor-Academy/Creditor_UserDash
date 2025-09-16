import React from 'react';
import { Button } from '@/components/ui/button';
import { Quote, X } from 'lucide-react';

const QuoteTemplateSidebar = ({ 
  isOpen, 
  onClose, 
  quoteTemplates, 
  onQuoteTemplateSelect 
}) => {
  if (!isOpen) return null;

  const defaultQuoteTemplates = [
    {
      id: 'quote_a',
      title: 'Quote A',
      description: 'Elegant quote with decorative borders and formal styling',
      icon: <Quote className="h-6 w-6" />,
      defaultContent: {
        quote: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        authorImage: "",
        backgroundImage: ""
      }
    },
    {
      id: 'quote_b',
      title: 'Quote B',
      description: 'Clean minimalist quote with large text and elegant typography',
      icon: <Quote className="h-6 w-6" />,
      defaultContent: {
        quote: "It is during our darkest moments that we must focus to see the light.",
        author: "Aristotle",
        authorImage: "",
        backgroundImage: ""
      }
    },
    {
      id: 'quote_c',
      title: 'Quote C',
      description: 'Quote with author image in side-by-side layout',
      icon: <Quote className="h-6 w-6" />,
      defaultContent: {
        quote: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
        authorImage: "https://i.pinimg.com/736x/98/06/cc/9806ccea886a7b22d44175b6fa2417ea.jpg",
        backgroundImage: ""
      }
    },
    {
      id: 'quote_d',
      title: 'Quote D',
      description: 'Elegant quote with sophisticated typography and left-aligned layout',
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

  const templates = quoteTemplates || defaultQuoteTemplates;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="relative bg-white w-96 h-full shadow-xl overflow-y-auto animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Quote Templates</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => onQuoteTemplateSelect(template)}
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
                    <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                      {template.id === 'quote_b' && (
                        <div className="bg-white p-4">
                          <div className="text-sm italic text-gray-700 mb-2 leading-relaxed font-light">
                            {template.defaultContent.quote}
                          </div>
                          <div className="text-xs text-orange-500 font-medium">
                            {template.defaultContent.author}
                          </div>
                        </div>
                      )}
                      {template.id === 'quote_c' && (
                        <div className="bg-white p-4 flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <img 
                              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm" 
                              src={template.defaultContent.authorImage} 
                              alt={template.defaultContent.author}
                            />
                          </div>
                          <div>
                            <div className="text-sm text-gray-700 mb-1">
                              {template.defaultContent.quote}
                            </div>
                            <div className="text-xs text-gray-500">
                              {template.defaultContent.author}
                            </div>
                          </div>
                        </div>
                      )}
                      {template.id === 'quote_d' && (
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4">
                          <div className="relative pl-6">
                            <svg className="absolute left-0 top-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                            </svg>
                            <p className="text-sm text-gray-700 mb-2">{template.defaultContent.quote}</p>
                          </div>
                          <div className="flex items-center mt-4">
                            <div className="w-4 h-px bg-gray-300 mr-2"></div>
                            <span className="text-xs font-medium text-gray-600">{template.defaultContent.author}</span>
                          </div>
                        </div>
                      )}
                      {template.id === 'quote_on_image' && (
                        <div className="relative h-24 bg-cover bg-center" style={{ backgroundImage: `url(${template.defaultContent.backgroundImage})` }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                          <div className="relative h-full flex items-end p-3">
                            <div className="text-white">
                              <p className="text-xs font-light leading-tight line-clamp-2">{template.defaultContent.quote}</p>
                              <p className="text-[10px] text-white/80 mt-1">{template.defaultContent.author}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {template.id === 'quote_a' && (
                        <div className="border-l-4 border-blue-200 pl-3 py-2 bg-white">
                          <p className="text-sm text-gray-700 italic">"{template.defaultContent.quote}"</p>
                          <p className="text-xs text-gray-500 mt-1">— {template.defaultContent.author}</p>
                        </div>
                      )}
                      {template.id === 'quote_carousel' && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                          <div className="text-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Quote className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-sm text-gray-800 mb-2 italic font-medium">"{template.defaultContent.quotes[0].quote}"</p>
                            <p className="text-xs text-indigo-600 font-semibold">— {template.defaultContent.quotes[0].author}</p>
                            <div className="flex justify-center mt-3 space-x-1">
                              {[1, 2, 3].map((dot) => (
                                <span key={dot} className={`h-2 w-2 rounded-full transition-all ${dot === 1 ? 'bg-indigo-500 scale-110' : 'bg-gray-300'}`}></span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteTemplateSidebar;