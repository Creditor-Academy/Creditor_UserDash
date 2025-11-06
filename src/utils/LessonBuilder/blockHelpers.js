// Utility functions for content blocks

export const generateBlockId = () => `block_${Date.now()}`;

export const getPlainText = (html) => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

export const convertToUnifiedFormat = (contentBlocks, lessonContent, lessonTitle, lessonData) => {
  // Use contentBlocks if available, otherwise fall back to lessonContent
  const sourceBlocks = (contentBlocks && contentBlocks.length > 0) 
    ? contentBlocks 
    : (lessonContent?.data?.content || []);

  const convertedBlocks = sourceBlocks.map((block, index) => {
    const baseBlock = {
      id: block.id || block.block_id || `block-${index}`,
      type: block.type || 'text',
      order: block.order || index
    };

    switch (block.type) {
      case 'text':
        return {
          ...baseBlock,
          content: block.content || block.html_css || '',
          textType: block.textType || 'paragraph'
        };
      
      case 'image':
        return {
          ...baseBlock,
          imageUrl: block.imageUrl || block.details?.image_url || '',
          imageTitle: block.imageTitle || block.details?.caption || 'Image',
          imageDescription: block.imageDescription || block.text || block.details?.description || '',
          layout: block.layout || block.details?.layout || 'centered'
        };
      
      case 'video':
        return {
          ...baseBlock,
          videoUrl: block.videoUrl || block.details?.video_url || '',
          videoTitle: block.videoTitle || block.details?.caption || 'Video',
          videoDescription: block.videoDescription || block.details?.description || ''
        };
      
      case 'youtube':
        return {
          ...baseBlock,
          youtubeId: block.youtubeId || (block.youtubeUrl || block.details?.url)?.split('v=')[1]?.split('&')[0] || '',
          youtubeTitle: block.youtubeTitle || block.details?.caption || 'YouTube Video',
          youtubeDescription: block.youtubeDescription || block.details?.description || ''
        };
      
      case 'audio':
        return {
          ...baseBlock,
          audioUrl: block.audioUrl || block.details?.audio_url || '',
          audioTitle: block.audioTitle || block.details?.caption || 'Audio',
          audioDescription: block.audioDescription || block.details?.description || ''
        };
      
      case 'pdf':
        return {
          ...baseBlock,
          pdfUrl: block.pdfUrl || block.details?.pdf_url || '',
          pdfTitle: block.pdfTitle || block.details?.caption || 'PDF Document',
          pdfDescription: block.pdfDescription || block.details?.description || ''
        };
      
      case 'statement':
        return {
          ...baseBlock,
          content: block.content || block.html_css || '',
          textType: 'statement'
        };
      
      default:
        return {
          ...baseBlock,
          type: 'text',
          content: block.content || block.html_css || 'Content block',
          textType: 'paragraph'
        };
    }
  });

  return {
    title: lessonTitle || lessonData?.title || 'Untitled Lesson',
    description: lessonData?.description || '',
    blocks: convertedBlocks.sort((a, b) => (a.order || 0) - (b.order || 0))
  };
};

export const detectTextType = (htmlContent) => {
  let detectedTextType = 'paragraph'; // default
  
  // Check for master heading first (has gradient background)
  if (htmlContent.includes('linear-gradient') && htmlContent.includes('<h1')) {
    detectedTextType = 'master_heading';
  } else if (htmlContent.includes('<h1') && htmlContent.includes('<p')) {
    detectedTextType = 'heading_paragraph';
  } else if (htmlContent.includes('<h2') && htmlContent.includes('<p')) {
    detectedTextType = 'subheading_paragraph';
  } else if (htmlContent.includes('<h1')) {
    detectedTextType = 'heading';
  } else if (htmlContent.includes('<h2')) {
    detectedTextType = 'subheading';
  } else if (htmlContent.includes('<table') || htmlContent.includes('grid')) {
    detectedTextType = 'table';
  }
  
  return detectedTextType;
};

export const extractTextContent = (htmlContent, textType) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  let heading = '';
  let subheading = '';
  let content = '';
  
  if (textType === 'heading_paragraph') {
    const h1 = tempDiv.querySelector('h1') || tempDiv.querySelector('[class*="heading"]') || tempDiv.querySelector('h2, h3, h4, h5, h6');
    const p = tempDiv.querySelector('p') || tempDiv.querySelector('div:not([class*="content-block"]):not([class*="prose"])') || tempDiv.querySelector('[class*="paragraph"]');
    
    if (h1) heading = h1.innerHTML || '';
    if (p) content = p.innerHTML || '';
    
    if (!heading && !content) {
      const fullHTML = tempDiv.innerHTML || '';
      const headingMatch = fullHTML.match(/<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/i);
      if (headingMatch) {
        heading = headingMatch[2] || '';
        const remainingHTML = fullHTML.replace(headingMatch[0], '').trim();
        if (remainingHTML) {
          const cleanedContent = remainingHTML
            .replace(/^<div[^>]*>/, '')
            .replace(/<\/div>$/, '')
            .trim();
          content = cleanedContent || remainingHTML;
        }
      }
    }
  } else if (textType === 'subheading_paragraph') {
    const h2 = tempDiv.querySelector('h2') || tempDiv.querySelector('[class*="subheading"]') || tempDiv.querySelector('h3, h4, h5, h6, h1');
    const p = tempDiv.querySelector('p') || tempDiv.querySelector('div:not([class*="content-block"]):not([class*="prose"])') || tempDiv.querySelector('[class*="paragraph"]');
    
    if (h2) subheading = h2.innerHTML || '';
    if (p) content = p.innerHTML || '';
  } else if (textType === 'master_heading') {
    const h1Element = tempDiv.querySelector('h1');
    if (h1Element) {
      content = h1Element.textContent || h1Element.innerText || 'Master Heading';
    } else {
      content = 'Master Heading';
    }
  } else {
    const contentElement = tempDiv.querySelector('h1, h2, h3, h4, h5, h6, p') || tempDiv;
    content = contentElement.innerHTML || htmlContent;
  }
  
  return { heading, subheading, content };
};