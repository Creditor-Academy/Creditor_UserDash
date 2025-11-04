import { useCallback, useMemo } from 'react';

// Performance optimization hooks for LessonBuilder
export const useLessonBuilderOptimizations = (contentBlocks, lessonContent) => {
  // Memoize the combined blocks to avoid recalculation
  const allBlocks = useMemo(() => {
    const blocks =
      contentBlocks && contentBlocks.length > 0
        ? [...contentBlocks]
        : lessonContent?.data?.content
          ? [...lessonContent.data.content]
          : [];

    return blocks.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [contentBlocks, lessonContent?.data?.content]);

  // Memoize block type detection
  const getBlockType = useCallback(block => {
    if (block.type === 'text' && block.html_css) {
      const htmlContent = block.html_css.toLowerCase();
      const hasH1 = htmlContent.includes('<h1');
      const hasH2 = htmlContent.includes('<h2');
      const hasP = htmlContent.includes('<p');
      const hasGradient = htmlContent.includes('linear-gradient');

      if (hasGradient && hasH1) return 'master_heading';
      if (hasH1 && hasP) return 'heading_paragraph';
      if (hasH2 && hasP) return 'subheading_paragraph';
      if (hasH1) return 'heading';
      if (hasH2) return 'subheading';
      return 'paragraph';
    }
    return block.type;
  }, []);

  // Memoize plain text extraction
  const getPlainText = useCallback(html => {
    if (typeof document === 'undefined') return html || '';
    const temp = document.createElement('div');
    temp.innerHTML = html || '';
    return temp.textContent || temp.innerText || '';
  }, []);

  // Memoize carousel functions setup
  const setupCarouselFunctions = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.carouselPrev = button => {
        const carousel = button.closest('.quote-carousel-*');
        if (carousel) {
          const currentIndex = parseInt(carousel.dataset.current || '0');
          const items = carousel.querySelectorAll('.quote-slide');
          const newIndex =
            currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          showCarouselItem(carousel, newIndex);
        }
      };

      window.carouselNext = button => {
        const carousel = button.closest('.quote-carousel-*');
        if (carousel) {
          const currentIndex = parseInt(carousel.dataset.current || '0');
          const items = carousel.querySelectorAll('.quote-slide');
          const newIndex =
            currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          showCarouselItem(carousel, newIndex);
        }
      };

      window.carouselGoTo = (button, index) => {
        const carousel = button.closest('.quote-carousel-*');
        if (carousel) {
          showCarouselItem(carousel, index);
        }
      };

      const showCarouselItem = (carousel, index) => {
        const items = carousel.querySelectorAll('.quote-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');

        items.forEach((item, i) => {
          item.classList.toggle('hidden', i !== index);
          item.classList.toggle('block', i === index);
        });

        dots.forEach((dot, i) => {
          dot.classList.toggle('bg-gradient-to-r', i === index);
          dot.classList.toggle('from-blue-500', i === index);
          dot.classList.toggle('to-purple-500', i === index);
          dot.classList.toggle('scale-110', i === index);
          dot.classList.toggle('shadow-md', i === index);
          dot.classList.toggle('bg-slate-300', i !== index);
        });

        carousel.dataset.current = index.toString();
      };
    }
  }, []);

  return {
    allBlocks,
    getBlockType,
    getPlainText,
    setupCarouselFunctions,
  };
};

// Debounce hook for search and input operations
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Auto-save hook
export const useAutoSave = (data, saveFunction, delay = 5000) => {
  const debouncedData = useDebounce(data, delay);

  useEffect(() => {
    if (debouncedData) {
      saveFunction(debouncedData);
    }
  }, [debouncedData, saveFunction]);
};
