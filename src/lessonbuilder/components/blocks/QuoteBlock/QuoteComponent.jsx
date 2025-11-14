import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Quote, X, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { uploadImage } from '@/services/imageUploadService';
import ImageEditor from '../MediaBlocks/ImageEditor';
import devLogger from '@lessonbuilder/utils/devLogger';

const QuoteComponent = forwardRef(
  (
    {
      showQuoteTemplateSidebar,
      setShowQuoteTemplateSidebar,
      showQuoteEditDialog,
      setShowQuoteEditDialog,
      onQuoteTemplateSelect,
      onQuoteUpdate,
      editingQuoteBlock,
      onAICreation,
    },
    ref
  ) => {
    // Quote editing state
    const [quoteText, setQuoteText] = useState('');
    const [quoteAuthor, setQuoteAuthor] = useState('');
    const [quoteImage, setQuoteImage] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');
    const [carouselQuotes, setCarouselQuotes] = useState([
      { quote: '', author: '' },
      { quote: '', author: '' },
      { quote: '', author: '' },
    ]);
    const [activeCarouselTab, setActiveCarouselTab] = useState(0);
    const [imageUploading, setImageUploading] = useState(false);
    const [authorImageUploading, setAuthorImageUploading] = useState(false);

    // Image editor state
    const [showImageEditor, setShowImageEditor] = useState(false);
    const [imageToEdit, setImageToEdit] = useState(null);
    const [imageEditorTitle, setImageEditorTitle] = useState('Edit Image');
    const [imageEditorType, setImageEditorType] = useState('author'); // 'author' or 'background'

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      setCarouselQuotes,
      setActiveCarouselTab,
    }));

    const handleImageUpload = async (e, setImage, imageType = 'background') => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload only JPG, PNG, or WebP images');
        return;
      }

      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Image size should be less than 100MB');
        return;
      }

      // Show image editor instead of directly uploading
      setImageToEdit(file);
      setImageEditorType(imageType);
      setImageEditorTitle(
        imageType === 'author' ? 'Edit Author Image' : 'Edit Background Image'
      );
      setShowImageEditor(true);
    };

    const handleImageEditorSave = async editedFile => {
      // Close image editor immediately to show uploading state
      setShowImageEditor(false);
      setImageToEdit(null);

      try {
        // Set appropriate loading state
        if (imageEditorType === 'background') {
          setImageUploading(true);
        } else if (imageEditorType === 'author') {
          setAuthorImageUploading(true);
        }

        // Upload edited image to cloud
        const uploadResult = await uploadImage(editedFile, {
          folder: 'lesson-images',
          public: true,
        });

        if (uploadResult.success && uploadResult.imageUrl) {
          // Set the appropriate image state
          if (imageEditorType === 'background') {
            setBackgroundImage(uploadResult.imageUrl);
          } else if (imageEditorType === 'author') {
            setQuoteImage(uploadResult.imageUrl);
          }
          toast.success('Image edited and uploaded successfully!');
        } else {
          throw new Error('Upload failed - no image URL returned');
        }
      } catch (error) {
        devLogger.error('Error uploading edited image:', error);
        toast.error(
          error.message || 'Failed to upload edited image. Please try again.'
        );
      } finally {
        // Reset appropriate loading state
        if (imageEditorType === 'background') {
          setImageUploading(false);
        } else if (imageEditorType === 'author') {
          setAuthorImageUploading(false);
        }
      }
    };

    const handleImageEditorClose = () => {
      setShowImageEditor(false);
      setImageToEdit(null);
    };

    const handleCarouselQuoteChange = (index, field, value) => {
      const updatedQuotes = [...carouselQuotes];
      updatedQuotes[index] = { ...updatedQuotes[index], [field]: value };
      setCarouselQuotes(updatedQuotes);
    };

    const addCarouselSlide = () => {
      setCarouselQuotes([...carouselQuotes, { quote: '', author: '' }]);
    };

    const removeCarouselSlide = index => {
      if (carouselQuotes.length > 1) {
        const updatedQuotes = carouselQuotes.filter((_, i) => i !== index);
        setCarouselQuotes(updatedQuotes);
        if (activeCarouselTab >= updatedQuotes.length) {
          setActiveCarouselTab(updatedQuotes.length - 1);
        }
      }
    };

    // Setup global carousel functions
    useEffect(() => {
      // Global carousel navigation functions
      window.carouselPrev = button => {
        const carousel = button.closest('[class*="quote-carousel"]');
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.quote-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        let currentIndex = parseInt(carousel.dataset.current || '0');

        const newIndex =
          currentIndex > 0 ? currentIndex - 1 : slides.length - 1;
        showCarouselSlide(carousel, slides, dots, newIndex);
      };

      window.carouselNext = button => {
        const carousel = button.closest('[class*="quote-carousel"]');
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.quote-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        let currentIndex = parseInt(carousel.dataset.current || '0');

        const newIndex =
          currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
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
          // Normalize existing styles to avoid conflicts
          dot.classList.remove(
            // inactive variants
            'bg-gray-300',
            'hover:bg-gray-400',
            'bg-slate-300',
            'hover:bg-slate-400',
            'hover:scale-105',
            // active variants
            'bg-indigo-500',
            'scale-110',
            'shadow-md',
            'bg-gradient-to-r',
            'from-blue-500',
            'to-purple-500'
          );

          if (i === index) {
            // Match active styling used in generated HTML for dots
            dot.classList.add(
              'bg-gradient-to-r',
              'from-blue-500',
              'to-purple-500',
              'scale-110',
              'shadow-md'
            );
          } else {
            // Inactive styling
            dot.classList.add(
              'bg-slate-300',
              'hover:bg-slate-400',
              'hover:scale-105'
            );
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
        description: 'Elegant quote with decorative borders and formal styling',
        icon: <Quote className="h-6 w-6" />,
        defaultContent: {
          quote:
            'The future belongs to those who believe in the beauty of their dreams.',
          author: 'Eleanor Roosevelt',
          authorImage: '',
          backgroundImage: '',
        },
      },
      {
        id: 'quote_b',
        title: 'Quote B',
        description:
          'Clean minimalist quote with large text and elegant typography',
        icon: <Quote className="h-6 w-6" />,
        defaultContent: {
          quote:
            'It is during our darkest moments that we must focus to see the light.',
          author: 'Aristotle',
          authorImage: '',
          backgroundImage: '',
        },
      },
      {
        id: 'quote_c',
        title: 'Quote C',
        description: 'Quote with author image in side-by-side layout',
        icon: <Quote className="h-6 w-6" />,
        defaultContent: {
          quote: 'The way to get started is to quit talking and begin doing.',
          author: 'Walt Disney',
          authorImage:
            'https://i.pinimg.com/736x/98/06/cc/9806ccea886a7b22d44175b6fa2417ea.jpg',
          backgroundImage: '',
        },
      },
      {
        id: 'quote_d',
        title: 'Quote D',
        description:
          'Elegant quote with sophisticated typography and left-aligned layout',
        icon: <Quote className="h-6 w-6" />,
        defaultContent: {
          quote:
            "Life is what happens to you while you're busy making other plans.",
          author: 'John Lennon',
          authorImage: '',
          backgroundImage: '',
        },
      },
      {
        id: 'quote_on_image',
        title: 'Quote on Image',
        description: 'Quote overlay on a background image with gradient',
        icon: <Quote className="h-6 w-6" />,
        defaultContent: {
          quote: 'The only way to do great work is to love what you do.',
          author: 'Steve Jobs',
          authorImage: '',
          backgroundImage:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        },
      },
      {
        id: 'quote_carousel',
        title: 'Quote Carousel',
        description: 'Multiple quotes in an interactive carousel format',
        icon: <Quote className="h-6 w-6" />,
        defaultContent: {
          quotes: [
            {
              quote:
                'The future belongs to those who believe in the beauty of their dreams.',
              author: 'Eleanor Roosevelt',
            },
            {
              quote:
                'It is during our darkest moments that we must focus to see the light.',
              author: 'Aristotle',
            },
            {
              quote:
                'The way to get started is to quit talking and begin doing.',
              author: 'Walt Disney',
            },
          ],
        },
      },
    ];

    // Initialize quote editing state when dialog opens
    React.useEffect(() => {
      if (showQuoteEditDialog && editingQuoteBlock) {
        try {
          const quoteContent = JSON.parse(editingQuoteBlock.content || '{}');
          setQuoteText(quoteContent.quote || '');
          setQuoteAuthor(quoteContent.author || '');
          setQuoteImage(quoteContent.authorImage || '');
          setBackgroundImage(quoteContent.backgroundImage || '');

          // For carousel quotes
          if (quoteContent.quotes) {
            setCarouselQuotes(quoteContent.quotes);
          } else if (editingQuoteBlock.textType === 'quote_carousel') {
            // Initialize with default carousel quotes if none exist
            setCarouselQuotes([
              { quote: '', author: '' },
              { quote: '', author: '' },
              { quote: '', author: '' },
            ]);
          }
        } catch (e) {
          devLogger.error('Error parsing quote content:', e);
          setQuoteText('');
          setQuoteAuthor('');
          setQuoteImage('');
          setBackgroundImage('');
        }
      }
    }, [showQuoteEditDialog, editingQuoteBlock]);

    const handleQuoteTemplateSelect = template => {
      let htmlContent = '';
      const content = template.defaultContent;

      switch (template.id) {
        case 'quote_a':
          htmlContent = `
          <div class="relative bg-gradient-to-br from-gray-50 to-white p-12 max-w-4xl mx-auto rounded-lg shadow-sm border border-gray-100">
            <div class="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg"></div>
            <div class="relative z-10">
              <div class="w-16 h-px bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
              <div class="text-center">
                <svg class="w-8 h-8 text-blue-500/30 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
                <blockquote class="text-xl text-gray-700 mb-8 leading-relaxed font-light italic tracking-wide">
                  "${content.quote}"
                </blockquote>
                <cite class="text-sm font-semibold text-gray-600 not-italic uppercase tracking-wider letter-spacing-wide">— ${content.author}</cite>
              </div>
              <div class="w-16 h-px bg-gradient-to-r from-purple-600 to-blue-500 mx-auto mt-8"></div>
            </div>
          </div>
        `;
          break;

        case 'quote_b':
          htmlContent = `
          <div class="relative bg-white py-16 px-8 max-w-5xl mx-auto">
            <div class="text-center">
              <blockquote class="text-2xl md:text-2xl text-gray-800 mb-12 leading-relaxed font-light tracking-wide">
                ${content.quote}
              </blockquote>
              <cite class="text-lg font-medium text-orange-500 not-italic tracking-wider">${content.author}</cite>
            </div>
          </div>
        `;
          break;

        case 'quote_c':
          htmlContent = `
          <div class="relative bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto border border-gray-100">
            <div class="flex items-center space-x-8">
              <div class="flex-shrink-0">
                <img src="${content.authorImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&h=687&q=80'}" alt="${content.author}" class="w-20 h-20 rounded-full object-cover shadow-md" />
              </div>
              <div class="flex-1">
                <blockquote class="text-xl text-gray-700 mb-4 leading-relaxed font-normal italic">
                  "${content.quote}"
                </blockquote>
                <cite class="text-base font-semibold text-gray-600 not-italic">— ${content.author}</cite>
              </div>
            </div>
          </div>
        `;
          break;

        case 'quote_d':
          htmlContent = `
          <div class="relative bg-gradient-to-br from-slate-50 to-gray-50 py-20 px-12 max-w-4xl mx-auto">
            <div class="text-left max-w-xl">
              <div class="mb-8">
                <svg class="w-12 h-12 text-slate-300 mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
                <blockquote class="text-lg md:text-xl text-slate-700 leading-relaxed font-light mb-8">
                  ${content.quote}
                </blockquote>
              </div>
              <div class="flex items-center">
                <div class="w-8 h-px bg-slate-400 mr-4"></div>
                <cite class="text-sm font-medium text-slate-600 not-italic uppercase tracking-widest">${content.author}</cite>
              </div>
            </div>
          </div>
        `;
          break;

        case 'quote_on_image':
          htmlContent = `
          <div class="relative rounded-2xl overflow-hidden shadow-2xl max-w-3xl mx-auto h-[300px]" style="background-image: url('${content.backgroundImage}'); background-size: cover; background-position: center;">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>
            <div class="relative z-10 flex items-center justify-center h-full p-4 md:p-6">
              <div class="text-center max-w-xl w-full">
                <div class="mb-3">
                  <svg class="w-6 h-6 text-white/30 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                  </svg>
                  <blockquote class="text-base md:text-lg lg:text-xl text-white leading-tight font-extralight mb-4 tracking-wide">
                    ${content.quote}
                  </blockquote>
                </div>
                <div class="flex items-center justify-center">
                  <div class="w-8 h-px bg-white/60 mr-4"></div>
                  <cite class="text-lg font-light text-white/95 not-italic uppercase tracking-[0.2em]">${content.author}</cite>
                  <div class="w-8 h-px bg-white/60 ml-4"></div>
                </div>
              </div>
            </div>
          </div>
        `;
          break;

        case 'quote_carousel':
          htmlContent = `
          <div class="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-2xl shadow-lg border border-slate-200/50 p-6 max-w-2xl mx-auto overflow-hidden backdrop-blur-sm">
            <!-- Enhanced decorative elements -->
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>
            <div class="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-200/20 via-purple-200/20 to-pink-200/20 rounded-full blur-2xl"></div>
            <div class="absolute -bottom-6 -left-6 w-28 h-28 bg-gradient-to-br from-indigo-200/20 via-blue-200/20 to-cyan-200/20 rounded-full blur-2xl"></div>
            <div class="absolute top-1/2 right-8 w-16 h-16 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full blur-xl"></div>
            
            <div class="quote-carousel-${Date.now()} relative z-10" data-current="0">
              ${content.quotes
                .map(
                  (q, index) => `
                <div class="quote-slide ${index === 0 ? 'block' : 'hidden'} transition-all duration-700 ease-in-out transform" data-index="${index}">
                  <div class="text-center py-8 px-6">
                    <!-- Enhanced quote icon with animation -->
                    <div class="flex justify-center mb-4">
                      <div class="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                        <svg class="w-6 h-6 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                        </svg>
                      </div>
                    </div>
                    
                    <!-- Enhanced quote text with better typography -->
                    <blockquote class="text-lg md:text-xl text-slate-800 mb-6 leading-relaxed font-light italic min-h-[80px] flex items-center justify-center tracking-wide">
                      <span class="relative">
                        "${q.quote}"
                        <div class="absolute -left-4 -top-2 text-6xl text-blue-200/30 font-serif">"</div>
                        <div class="absolute -right-4 -bottom-6 text-6xl text-purple-200/30 font-serif">"</div>
                      </span>
                    </blockquote>
                    
                    <!-- Enhanced author section -->
                    <div class="flex items-center justify-center space-x-4">
                      <div class="w-12 h-px bg-gradient-to-r from-transparent via-slate-400 to-slate-400"></div>
                      <cite class="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text not-italic tracking-wider uppercase text-sm letter-spacing-widest">${q.author}</cite>
                      <div class="w-12 h-px bg-gradient-to-r from-slate-400 via-slate-400 to-transparent"></div>
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
              
              <!-- Enhanced navigation with better styling -->
              <div class="flex justify-center items-center space-x-6 mt-6 pt-4 border-t border-slate-200/60">
                <button onclick="window.carouselPrev && window.carouselPrev(this)" class="carousel-prev group bg-white/80 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full p-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                  <svg class="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                
                <div class="flex space-x-2">
                  ${content.quotes
                    .map(
                      (_, index) => `
                    <button onclick="window.carouselGoTo && window.carouselGoTo(this, ${index})" class="carousel-dot w-3 h-3 rounded-full transition-all duration-300 transform ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-110 shadow-md' : 'bg-slate-300 hover:bg-slate-400 hover:scale-105'}" data-index="${index}"></button>
                  `
                    )
                    .join('')}
                </div>
                
                <button onclick="window.carouselNext && window.carouselNext(this)" class="carousel-next group bg-white/80 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full p-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                  <svg class="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        textType: template.id,
        content: JSON.stringify(content),
        html_css: htmlContent,
        details: {
          quote: content.quote || content.quotes?.[0]?.quote || '',
          author: content.author || content.quotes?.[0]?.author || '',
          authorImage: content.authorImage || '',
          backgroundImage: content.backgroundImage || '',
          templateId: template.id,
        },
      };

      onQuoteTemplateSelect(newBlock);
      setShowQuoteTemplateSidebar(false);
    };

    const handleQuoteUpdate = () => {
      if (!editingQuoteBlock) return;

      let updatedContent = {};

      switch (editingQuoteBlock.textType) {
        case 'quote_carousel':
          updatedContent = { quotes: carouselQuotes };
          break;

        case 'quote_on_image':
          updatedContent = {
            quote: quoteText,
            author: quoteAuthor,
            backgroundImage: backgroundImage,
          };
          break;

        case 'quote_c':
          updatedContent = {
            quote: quoteText,
            author: quoteAuthor,
            authorImage: quoteImage,
          };
          break;

        default: // For quote_a, quote_b, quote_d
          updatedContent = {
            quote: quoteText,
            author: quoteAuthor,
          };
      }

      onQuoteUpdate(editingQuoteBlock.id, JSON.stringify(updatedContent));
      setShowQuoteEditDialog(false);
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
                <h2 className="text-xl font-semibold text-gray-900">
                  Quote Templates
                </h2>
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
                  {/* AI Generation Option */}
                  <div
                    onClick={() => {
                      setShowQuoteTemplateSidebar(false);
                      if (onAICreation) {
                        onAICreation({ id: 'quote', title: 'Quote' });
                      }
                    }}
                    className="p-4 border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-md cursor-pointer transition-all duration-200 group bg-gradient-to-br from-purple-50 to-pink-50"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-purple-900 mb-1 flex items-center gap-2">
                          Generate with AI
                          <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                            Recommended
                          </span>
                        </h3>
                        <p className="text-xs text-purple-700 leading-relaxed">
                          Describe what you want and let AI create professional
                          quote content instantly
                        </p>

                        {/* Preview */}
                        <div className="mt-3 overflow-hidden rounded-lg border border-purple-100">
                          <div className="bg-white/70 p-4">
                            <div className="flex items-center gap-2 text-purple-600">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                              <span className="text-sm font-medium">
                                AI-powered quote generation
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {quoteTemplates.map(template => (
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
                                  <svg
                                    className="absolute left-0 top-0 h-5 w-5 text-gray-300"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                                  </svg>
                                  <p className="text-sm text-gray-700 mb-2">
                                    {template.defaultContent.quote}
                                  </p>
                                </div>
                                <div className="flex items-center mt-4">
                                  <div className="w-4 h-px bg-gray-300 mr-2"></div>
                                  <span className="text-xs font-medium text-gray-600">
                                    {template.defaultContent.author}
                                  </span>
                                </div>
                              </div>
                            )}
                            {template.id === 'quote_on_image' && (
                              <div
                                className="relative h-24 bg-cover bg-center"
                                style={{
                                  backgroundImage: `url(${template.defaultContent.backgroundImage})`,
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="relative h-full flex items-end p-3">
                                  <div className="text-white">
                                    <p className="text-xs font-light leading-tight line-clamp-2">
                                      {template.defaultContent.quote}
                                    </p>
                                    <p className="text-[10px] text-white/80 mt-1">
                                      {template.defaultContent.author}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {template.id === 'quote_a' && (
                              <div className="border-l-4 border-blue-200 pl-3 py-2 bg-white">
                                <p className="text-sm text-gray-700 italic">
                                  "{template.defaultContent.quote}"
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  — {template.defaultContent.author}
                                </p>
                              </div>
                            )}
                            {template.id === 'quote_carousel' && (
                              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                                <div className="text-center">
                                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Quote className="w-3 h-3 text-white" />
                                  </div>
                                  <p className="text-sm text-gray-800 mb-2 italic font-medium">
                                    "{template.defaultContent.quotes[0].quote}"
                                  </p>
                                  <p className="text-xs text-indigo-600 font-semibold">
                                    — {template.defaultContent.quotes[0].author}
                                  </p>
                                  <div className="flex justify-center mt-3 space-x-1">
                                    {[1, 2, 3].map(dot => (
                                      <span
                                        key={dot}
                                        className={`h-2 w-2 rounded-full transition-all ${dot === 1 ? 'bg-indigo-500 scale-110' : 'bg-gray-300'}`}
                                      ></span>
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
        )}

        {/* Quote Edit Dialog */}
        <Dialog
          open={showQuoteEditDialog}
          onOpenChange={setShowQuoteEditDialog}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit{' '}
                {editingQuoteBlock?.textType
                  ?.replace('_', ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editingQuoteBlock?.textType === 'quote_carousel' ? (
                <div className="space-y-6">
                  {/* Header with Add Slide Button */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Carousel Slides
                    </h3>
                    <Button
                      onClick={addCarouselSlide}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slide
                    </Button>
                  </div>

                  {/* Slide Tabs */}
                  <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                    {carouselQuotes.map((_, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          activeCarouselTab === index
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
                        }`}
                        onClick={() => setActiveCarouselTab(index)}
                      >
                        Slide {index + 1}
                      </button>
                    ))}
                  </div>

                  {/* Slide Content Editor */}
                  {carouselQuotes.map((quote, index) => (
                    <div
                      key={index}
                      className={`${activeCarouselTab === index ? 'block' : 'hidden'} space-y-4`}
                    >
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-semibold text-indigo-900">
                            Slide {index + 1} Content
                          </h4>
                          {carouselQuotes.length > 1 && (
                            <Button
                              onClick={() => removeCarouselSlide(index)}
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 px-3 py-1 text-sm"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quote Text
                            </label>
                            <textarea
                              value={quote.quote}
                              onChange={e =>
                                handleCarouselQuoteChange(
                                  index,
                                  'quote',
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                              rows={4}
                              placeholder="Enter an inspiring quote..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Author Name
                            </label>
                            <input
                              type="text"
                              value={quote.author}
                              onChange={e =>
                                handleCarouselQuoteChange(
                                  index,
                                  'author',
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Author name"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-600 mb-3">
                          Preview:
                        </h5>
                        <div className="text-center py-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Quote className="w-4 h-4 text-white" />
                          </div>
                          <blockquote className="text-lg text-gray-800 mb-3 italic font-medium">
                            "{quote.quote || 'Your quote will appear here...'}"
                          </blockquote>
                          <cite className="text-md font-semibold text-indigo-600 not-italic">
                            {quote.author || 'Author Name'}
                          </cite>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quote Text
                    </label>
                    <textarea
                      value={quoteText}
                      onChange={e => setQuoteText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="Enter quote text..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={quoteAuthor}
                      onChange={e => setQuoteAuthor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Author name"
                    />
                  </div>

                  {/* Author Image Upload - Available only for quote_c */}
                  {editingQuoteBlock?.textType === 'quote_c' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author Image
                      </label>
                      <div className="space-y-2">
                        {quoteImage && (
                          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow">
                            <img
                              src={quoteImage}
                              alt="Author"
                              className="w-full h-full object-cover"
                            />
                            {/* Loading overlay for author image */}
                            {authorImageUploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                        )}
                        {/* Show loading placeholder when no image but uploading */}
                        {!quoteImage && authorImageUploading && (
                          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                          </div>
                        )}
                        <div>
                          <label
                            className={`cursor-pointer text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              authorImageUploading
                                ? 'bg-gray-200 cursor-not-allowed'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {authorImageUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                {quoteImage ? 'Change Image' : 'Upload Image'}
                              </>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              disabled={authorImageUploading}
                              onChange={e =>
                                handleImageUpload(e, setQuoteImage, 'author')
                              }
                            />
                          </label>
                          {quoteImage && (
                            <p className="text-xs text-gray-500 mt-2">
                              💡 Image uploaded to cloud and will be accessible
                              from anywhere
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Background Image Upload - Available for quote_on_image */}
                  {editingQuoteBlock?.textType === 'quote_on_image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Image
                      </label>
                      <div className="space-y-2">
                        {backgroundImage && (
                          <div className="relative w-full h-40 rounded-md overflow-hidden border">
                            <img
                              src={backgroundImage}
                              alt="Background"
                              className="w-full h-full object-cover"
                            />
                            {/* Loading overlay for background image */}
                            {imageUploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-center">
                                  <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                                  <p className="text-white text-sm font-medium">
                                    Uploading...
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Show loading placeholder when no image but uploading */}
                        {!backgroundImage && imageUploading && (
                          <div className="relative w-full h-40 rounded-md overflow-hidden border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                              <p className="text-gray-500 text-sm font-medium">
                                Uploading...
                              </p>
                            </div>
                          </div>
                        )}
                        <div>
                          <label
                            className={`cursor-pointer text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              imageUploading
                                ? 'bg-gray-200 cursor-not-allowed'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {imageUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                {backgroundImage
                                  ? 'Change Background'
                                  : 'Upload Background'}
                              </>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              disabled={imageUploading}
                              onChange={e =>
                                handleImageUpload(
                                  e,
                                  setBackgroundImage,
                                  'background'
                                )
                              }
                            />
                          </label>
                          {backgroundImage && (
                            <p className="text-xs text-gray-500 mt-2">
                              💡 Image uploaded to cloud and will be accessible
                              from anywhere
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowQuoteEditDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleQuoteUpdate}
                disabled={
                  editingQuoteBlock?.textType === 'quote_carousel'
                    ? carouselQuotes.some(
                        q => !q.quote.trim() || !q.author.trim()
                      )
                    : !quoteText.trim() || !quoteAuthor.trim()
                }
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Update Quote
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Editor */}
        <ImageEditor
          isOpen={showImageEditor}
          onClose={handleImageEditorClose}
          imageFile={imageToEdit}
          onSave={handleImageEditorSave}
          title={imageEditorTitle}
        />
      </>
    );
  }
);

export default QuoteComponent;
