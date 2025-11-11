/**
 * Content Library Usage Analyzer
 * Analyzes which content blocks and variants are used vs available
 */

// All 13 available content library blocks
export const AVAILABLE_BLOCKS = {
  text: {
    id: 'text',
    name: 'Text Block',
    variants: [
      'heading', // H1 heading (24px, bold)
      'master_heading', // Gradient background heading (32px, extrabold)
      'subheading', // H2 subheading (20px, semibold)
      'paragraph', // Regular text (16px, normal)
      'heading_paragraph', // H1 + paragraph combination
      'subheading_paragraph', // H2 + paragraph combination
    ],
    totalVariants: 6,
  },
  statement: {
    id: 'statement',
    name: 'Statement Block',
    variants: [
      'callout', // Callout boxes with background colors
      'important', // Important statements with left border accent
      'highlight', // Highlighted text with emphasis styling
      'warning', // Warning statements with yellow/orange styling
      'info', // Info statements with blue styling
    ],
    totalVariants: 5,
  },
  quote: {
    id: 'quote',
    name: 'Quote Block',
    variants: [
      'quote_a', // Default style with author image on left
      'quote_b', // Large centered text with thin font
      'quote_c', // Author image with horizontal layout (16x16 rounded)
      'quote_d', // Slate background with left-aligned text
      'quote_on_image', // Quote overlay on background image
      'quote_carousel', // Multiple quotes with navigation controls
    ],
    totalVariants: 6,
  },
  image: {
    id: 'image',
    name: 'Image Block',
    variants: [
      'side-by-side', // Image + text horizontal layout
      'overlay', // Text overlay on image
      'centered', // Centered image with caption
      'full-width', // Full-width image with description
    ],
    totalVariants: 4,
  },
  video: {
    id: 'video',
    name: 'Video Block',
    variants: [
      'file-upload', // Direct video file upload
      'url-input', // External video URL
      'native-player', // Native video player with controls
      'responsive', // Responsive sizing with aspect ratio
    ],
    totalVariants: 4,
  },
  audio: {
    id: 'audio',
    name: 'Audio Block',
    variants: [
      'file-upload', // Direct audio file upload
      'url-input', // External audio URL
      'custom-player', // Custom audio player with controls
      'waveform', // Waveform visualization
    ],
    totalVariants: 4,
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Block',
    variants: [
      'embedded', // Embedded iframe with responsive aspect ratio
      'thumbnail', // Thumbnail preview before embedding
      'auto-play', // Auto-play options
      'privacy-enhanced', // Privacy-enhanced mode
    ],
    totalVariants: 4,
  },
  link: {
    id: 'link',
    name: 'Link Block',
    variants: [
      'button-primary', // Primary button style
      'button-secondary', // Secondary button style
      'button-outline', // Outline button style
      'preview-card', // Link preview cards
    ],
    totalVariants: 4,
  },
  pdf: {
    id: 'pdf',
    name: 'PDF Block',
    variants: [
      'file-upload', // Direct PDF upload
      'url-input', // External PDF URL
      'embedded-viewer', // Embedded viewer with controls
      'download-link', // Download options with thumbnail
    ],
    totalVariants: 4,
  },
  list: {
    id: 'list',
    name: 'List Block',
    variants: [
      'unordered', // Bullet points
      'ordered', // Numbered items
      'checklist', // Interactive checkboxes
      'nested', // Nested lists support
    ],
    totalVariants: 4,
  },
  tables: {
    id: 'tables',
    name: 'Tables Block',
    variants: [
      'basic', // Simple rows/columns
      'styled', // With headers and borders
      'responsive', // Mobile-friendly
      'sortable', // Sortable columns
    ],
    totalVariants: 4,
  },
  interactive: {
    id: 'interactive',
    name: 'Interactive Block',
    variants: [
      'quiz', // Multiple choice questions
      'exercise', // Hands-on projects
      'code', // Syntax highlighted code
      'assessment', // Scoring and feedback
      'widget', // External interactive content
    ],
    totalVariants: 5,
  },
  divider: {
    id: 'divider',
    name: 'Divider Block',
    variants: [
      'simple', // Basic horizontal rule
      'styled', // With decorative elements
      'gradient', // Colored separators
      'text', // With centered text
    ],
    totalVariants: 4,
  },
};

// Blocks currently used by the course generator (UPDATED - Now uses ALL variants)
export const CURRENTLY_USED_BLOCKS = {
  text: {
    used: true,
    variants: {
      master_heading: true, // ✅ Used for lesson titles
      paragraph: true, // ✅ Used for lesson summaries
      heading: true, // ✅ Used for section headings
      subheading: true, // ✅ Used for subsection headings
      heading_paragraph: true, // ✅ Used for combined heading+content
      subheading_paragraph: false, // ❌ Still not used
    },
    usageCount: 5,
    totalAvailable: 6,
  },
  statement: {
    used: true,
    variants: {
      callout: true, // ✅ Used for real-world examples
      important: true, // ✅ Used for important notices
      highlight: false, // ❌ Not used
      warning: true, // ✅ Used for warning statements
      info: false, // ❌ Not used
    },
    usageCount: 3,
    totalAvailable: 5,
  },
  quote: {
    used: true,
    variants: {
      quote_a: true, // ✅ Used for inspirational quotes with author
      quote_b: false, // ❌ Not used in new version
      quote_c: false, // ❌ Not used
      quote_d: false, // ❌ Not used
      quote_on_image: false, // ❌ Not used
      quote_carousel: false, // ❌ Not used
    },
    usageCount: 1,
    totalAvailable: 6,
  },
  image: {
    used: true,
    variants: {
      centered: false, // ❌ Not used in new version
      overlay: false, // ❌ Not used in new version
      'side-by-side': true, // ✅ Used for concept comparisons
      'full-width': true, // ✅ Used for hero images
    },
    usageCount: 2,
    totalAvailable: 4,
  },
  video: {
    used: true,
    variants: {
      'file-upload': false, // ❌ Not used
      'url-input': false, // ❌ Not used
      'native-player': true, // ✅ Used for tutorial videos
      responsive: false, // ❌ Not used
    },
    usageCount: 1,
    totalAvailable: 4,
  },
  audio: {
    used: true,
    variants: {
      'file-upload': false, // ❌ Not used
      'url-input': false, // ❌ Not used
      'custom-player': true, // ✅ Used for audio guides
      waveform: false, // ❌ Not used
    },
    usageCount: 1,
    totalAvailable: 4,
  },
  youtube: {
    used: true,
    variants: {
      embedded: true, // ✅ Used for external tutorials
      thumbnail: false, // ❌ Not used
      'auto-play': false, // ❌ Not used
      'privacy-enhanced': false, // ❌ Not used
    },
    usageCount: 1,
    totalAvailable: 4,
  },
  link: {
    used: true,
    variants: {
      'button-primary': true, // ✅ Used for resource links
      'button-secondary': false, // ❌ Not used
      'button-outline': false, // ❌ Not used
      'preview-card': false, // ❌ Not used
    },
    usageCount: 1,
    totalAvailable: 4,
  },
  pdf: {
    used: true,
    variants: {
      'file-upload': false, // ❌ Not used
      'url-input': false, // ❌ Not used
      'embedded-viewer': true, // ✅ Used for reference guides
      'download-link': false, // ❌ Not used
    },
    usageCount: 1,
    totalAvailable: 4,
  },
  list: {
    used: true,
    variants: {
      unordered: true, // ✅ Used for learning goals
      ordered: true, // ✅ Used for step-by-step processes
      checklist: true, // ✅ Used for prerequisites
      nested: false, // ❌ Not used
    },
    usageCount: 3,
    totalAvailable: 4,
  },
  tables: {
    used: true,
    variants: {
      basic: false, // ❌ Not used
      styled: true, // ✅ Used for comparison tables
      responsive: false, // ❌ Not used
      sortable: false, // ❌ Not used
    },
    usageCount: 1,
    totalAvailable: 4,
  },
  interactive: {
    used: true,
    variants: {
      quiz: true, // ✅ Used for beginner/intermediate
      exercise: true, // ✅ Used for advanced difficulty
      code: true, // ✅ Used for advanced programming lessons
      assessment: true, // ✅ Used for final assessments
      widget: false, // ❌ Not used
    },
    usageCount: 4,
    totalAvailable: 5,
  },
  divider: {
    used: true,
    variants: {
      gradient: true, // ✅ Used at end of lessons
      simple: false, // ❌ Not used
      styled: true, // ✅ Used for section breaks
      text: false, // ❌ Not used
    },
    usageCount: 2,
    totalAvailable: 4,
  },
};

/**
 * Analyze content library usage
 * @returns {Object} Detailed usage analysis
 */
export function analyzeContentLibraryUsage() {
  const analysis = {
    totalBlocks: 13,
    usedBlocks: 0,
    unusedBlocks: 0,
    totalVariants: 0,
    usedVariants: 0,
    unusedVariants: 0,
    usageByBlock: {},
    recommendations: [],
  };

  // Calculate totals and usage
  Object.keys(AVAILABLE_BLOCKS).forEach(blockId => {
    const available = AVAILABLE_BLOCKS[blockId];
    const used = CURRENTLY_USED_BLOCKS[blockId];

    analysis.totalVariants += available.totalVariants;
    analysis.usedVariants += used.usageCount;
    analysis.unusedVariants += available.totalVariants - used.usageCount;

    if (used.used) {
      analysis.usedBlocks++;
    } else {
      analysis.unusedBlocks++;
    }

    analysis.usageByBlock[blockId] = {
      name: available.name,
      used: used.used,
      variantsUsed: used.usageCount,
      variantsAvailable: available.totalVariants,
      usagePercentage: Math.round(
        (used.usageCount / available.totalVariants) * 100
      ),
      unusedVariants: Object.keys(used.variants).filter(
        variant => !used.variants[variant]
      ),
    };
  });

  // Generate recommendations
  analysis.recommendations = generateRecommendations(analysis);

  return analysis;
}

/**
 * Generate recommendations for improving content variety
 */
function generateRecommendations(analysis) {
  const recommendations = [];

  // Unused blocks
  const unusedBlocks = Object.keys(analysis.usageByBlock).filter(
    blockId => !analysis.usageByBlock[blockId].used
  );

  if (unusedBlocks.length > 0) {
    recommendations.push({
      type: 'unused_blocks',
      priority: 'high',
      title: 'Add Missing Block Types',
      description: `${unusedBlocks.length} block types are completely unused`,
      blocks: unusedBlocks,
      suggestion:
        'Consider adding video, audio, YouTube, link, PDF, and table blocks for richer content',
    });
  }

  // Underutilized blocks
  const underutilizedBlocks = Object.keys(analysis.usageByBlock).filter(
    blockId => {
      const block = analysis.usageByBlock[blockId];
      return block.used && block.usagePercentage < 50;
    }
  );

  if (underutilizedBlocks.length > 0) {
    recommendations.push({
      type: 'underutilized_variants',
      priority: 'medium',
      title: 'Expand Variant Usage',
      description: `${underutilizedBlocks.length} blocks are using less than 50% of their variants`,
      blocks: underutilizedBlocks,
      suggestion:
        'Add more text variants (headings, subheadings), quote styles, and statement types',
    });
  }

  // Content diversity
  recommendations.push({
    type: 'content_diversity',
    priority: 'medium',
    title: 'Improve Content Diversity',
    description: `Only ${analysis.usedBlocks}/${analysis.totalBlocks} block types used`,
    suggestion:
      'Add multimedia content (videos, audio), external resources (PDFs, links), and structured data (tables)',
  });

  return recommendations;
}

/**
 * Generate detailed usage report
 */
export function generateUsageReport() {
  const analysis = analyzeContentLibraryUsage();

  console.log('📊 CONTENT LIBRARY USAGE ANALYSIS');
  console.log('=====================================');

  console.log(`📈 Overall Statistics:`);
  console.log(
    `   Blocks Used: ${analysis.usedBlocks}/${analysis.totalBlocks} (${Math.round((analysis.usedBlocks / analysis.totalBlocks) * 100)}%)`
  );
  console.log(
    `   Variants Used: ${analysis.usedVariants}/${analysis.totalVariants} (${Math.round((analysis.usedVariants / analysis.totalVariants) * 100)}%)`
  );
  console.log('');

  console.log('📋 Block-by-Block Analysis:');
  Object.keys(analysis.usageByBlock).forEach(blockId => {
    const block = analysis.usageByBlock[blockId];
    const status = block.used ? '✅' : '❌';
    console.log(
      `   ${status} ${block.name}: ${block.variantsUsed}/${block.variantsAvailable} variants (${block.usagePercentage}%)`
    );

    if (block.unusedVariants.length > 0) {
      console.log(`      Unused: ${block.unusedVariants.join(', ')}`);
    }
  });

  console.log('');
  console.log('💡 Recommendations:');
  analysis.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec.title} (${rec.priority} priority)`);
    console.log(`      ${rec.description}`);
    console.log(`      💡 ${rec.suggestion}`);
    console.log('');
  });

  return analysis;
}

/**
 * Get specific block usage details
 */
export function getBlockUsageDetails(blockId) {
  const available = AVAILABLE_BLOCKS[blockId];
  const used = CURRENTLY_USED_BLOCKS[blockId];

  if (!available || !used) {
    return { error: `Block '${blockId}' not found` };
  }

  return {
    blockName: available.name,
    totalVariants: available.totalVariants,
    availableVariants: available.variants,
    usedVariants: Object.keys(used.variants).filter(
      variant => used.variants[variant]
    ),
    unusedVariants: Object.keys(used.variants).filter(
      variant => !used.variants[variant]
    ),
    usagePercentage: Math.round(
      (used.usageCount / available.totalVariants) * 100
    ),
    isUsed: used.used,
  };
}

export default {
  analyzeContentLibraryUsage,
  generateUsageReport,
  getBlockUsageDetails,
  AVAILABLE_BLOCKS,
  CURRENTLY_USED_BLOCKS,
};
