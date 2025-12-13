/**
 * Advanced Lesson CSS Configuration
 * Maps ADDIE phases to Tailwind CSS classes and styling
 * Integrates with existing CSS from universalAILessonService and TextBlockComponent
 */

export const ADDIE_PHASE_CSS = {
  analysis: {
    masterHeading:
      'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    masterHeadingClasses:
      'rounded-xl p-6 text-white font-extrabold text-3xl md:text-4xl leading-tight tracking-tight text-center',
    contentBlock:
      'bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1',
    contentClasses: 'prose prose-lg max-w-none text-gray-700',
    dividerColor: '#3B82F6',
    dividerClasses:
      'bg-blue-600 hover:bg-blue-700 text-white text-center py-4 px-8 font-semibold text-lg tracking-wide cursor-pointer transition-colors',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    progressColor: 'from-indigo-500 to-purple-500',
    phaseLabel: 'ANALYSIS',
  },

  objectives: {
    masterHeading: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
    masterHeadingClasses:
      'rounded-xl p-6 text-white font-extrabold text-3xl md:text-4xl leading-tight tracking-tight text-center',
    contentBlock:
      'bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1',
    contentClasses: 'prose prose-lg max-w-none text-gray-700',
    dividerColor: '#1D4ED8',
    dividerClasses:
      'bg-blue-700 hover:bg-blue-800 text-white text-center py-4 px-8 font-semibold text-lg tracking-wide cursor-pointer transition-colors',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    progressColor: 'from-blue-500 to-purple-500',
    phaseLabel: 'OBJECTIVES',
  },

  design: {
    masterHeading: 'bg-gradient-to-r from-green-500 to-blue-500',
    masterHeadingClasses:
      'rounded-xl p-6 text-white font-extrabold text-3xl md:text-4xl leading-tight tracking-tight text-center',
    contentBlock:
      'bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1',
    contentClasses: 'prose prose-lg max-w-none text-gray-700',
    dividerColor: '#059669',
    dividerClasses:
      'bg-green-600 hover:bg-green-700 text-white text-center py-4 px-8 font-semibold text-lg tracking-wide cursor-pointer transition-colors',
    badgeColor: 'bg-green-100 text-green-800 border-green-300',
    progressColor: 'from-green-500 to-blue-500',
    phaseLabel: 'DESIGN',
  },

  experience: {
    masterHeading: 'bg-gradient-to-r from-orange-500 to-red-500',
    masterHeadingClasses:
      'rounded-xl p-6 text-white font-extrabold text-3xl md:text-4xl leading-tight tracking-tight text-center',
    contentBlock:
      'bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1',
    contentClasses: 'prose prose-lg max-w-none text-gray-700',
    dividerColor: '#F59E0B',
    dividerClasses:
      'bg-amber-500 hover:bg-amber-600 text-white text-center py-4 px-8 font-semibold text-lg tracking-wide cursor-pointer transition-colors',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    progressColor: 'from-orange-500 to-red-500',
    phaseLabel: 'EXPERIENCE',
  },

  development: {
    masterHeading: 'bg-gradient-to-r from-pink-500 to-purple-500',
    masterHeadingClasses:
      'rounded-xl p-6 text-white font-extrabold text-3xl md:text-4xl leading-tight tracking-tight text-center',
    contentBlock:
      'bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1',
    contentClasses: 'prose prose-lg max-w-none text-gray-700',
    dividerColor: '#A855F7',
    dividerClasses:
      'bg-purple-600 hover:bg-purple-700 text-white text-center py-4 px-8 font-semibold text-lg tracking-wide cursor-pointer transition-colors',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    progressColor: 'from-pink-500 to-purple-500',
    phaseLabel: 'DEVELOPMENT',
  },

  implementation: {
    masterHeading: 'bg-gradient-to-r from-teal-500 to-cyan-500',
    masterHeadingClasses:
      'rounded-xl p-6 text-white font-extrabold text-3xl md:text-4xl leading-tight tracking-tight text-center',
    contentBlock:
      'bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1',
    contentClasses: 'prose prose-lg max-w-none text-gray-700',
    dividerColor: '#06B6D4',
    dividerClasses:
      'bg-cyan-600 hover:bg-cyan-700 text-white text-center py-4 px-8 font-semibold text-lg tracking-wide cursor-pointer transition-colors',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    progressColor: 'from-teal-500 to-cyan-500',
    phaseLabel: 'IMPLEMENTATION',
  },

  quality: {
    masterHeading:
      'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    masterHeadingClasses:
      'rounded-xl p-6 text-white font-extrabold text-3xl md:text-4xl leading-tight tracking-tight text-center',
    contentBlock:
      'bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1',
    contentClasses: 'prose prose-lg max-w-none text-gray-700',
    dividerColor: '#4F46E5',
    dividerClasses:
      'bg-indigo-600 hover:bg-indigo-700 text-white text-center py-4 px-8 font-semibold text-lg tracking-wide cursor-pointer transition-colors',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    progressColor: 'from-indigo-500 to-purple-500',
    phaseLabel: 'QUALITY',
  },
};

// Block type to gradient mapping (from existing LessonBuilder.jsx)
export const BLOCK_TYPE_GRADIENTS = {
  text: 'from-indigo-500 to-purple-500',
  image: 'from-amber-500 to-orange-500',
  statement: 'from-fuchsia-500 to-pink-500',
  list: 'from-teal-500 to-emerald-500',
  quote: 'from-sky-500 to-cyan-500',
  interactive: 'from-purple-500 to-indigo-500',
  code: 'from-slate-500 to-slate-700',
  accordion: 'from-violet-500 to-purple-500',
  card: 'from-rose-500 to-pink-500',
  divider: 'from-zinc-500 to-slate-500',
  embed: 'from-red-500 to-rose-500',
  youtube: 'from-red-500 to-rose-500',
  video: 'from-violet-500 to-indigo-500',
  audio: 'from-emerald-500 to-teal-500',
  link: 'from-blue-500 to-indigo-500',
  pdf: 'from-slate-500 to-slate-700',
  tables: 'from-orange-500 to-amber-500',
};

/**
 * Get CSS configuration for a specific ADDIE phase
 */
export const getPhaseCSS = phase => {
  return ADDIE_PHASE_CSS[phase] || ADDIE_PHASE_CSS.analysis;
};

/**
 * Get gradient for a block type
 */
export const getBlockGradient = blockType => {
  return BLOCK_TYPE_GRADIENTS[blockType] || BLOCK_TYPE_GRADIENTS.text;
};

/**
 * Generate master heading HTML with phase CSS
 */
export const generateMasterHeadingHTML = (title, phase) => {
  const css = getPhaseCSS(phase);
  return `<div class="${css.masterHeading} ${css.masterHeadingClasses}">
    ${title}
  </div>`;
};

/**
 * Generate phase badge HTML
 */
export const generatePhaseBadgeHTML = phase => {
  const css = getPhaseCSS(phase);
  return `<div class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${css.badgeColor} mb-2 border">
    ${css.phaseLabel} PHASE
  </div>`;
};

/**
 * Generate content block HTML with phase CSS
 */
export const generateContentBlockHTML = (content, phase) => {
  const css = getPhaseCSS(phase);
  return `<div class="${css.contentBlock}">
    <article class="max-w-none">
      <div class="${css.contentClasses}">
        ${content}
      </div>
    </article>
  </div>`;
};

/**
 * Generate divider HTML with phase CSS and progress bar
 */
export const generateDividerHTML = (text, phase, progress = 0) => {
  const css = getPhaseCSS(phase);
  return `<div class="w-full py-6">
    <div class="mb-4 h-1 bg-gray-200 rounded-full overflow-hidden">
      <div class="h-full bg-gradient-to-r ${css.progressColor}" 
           style="width: ${progress}%"></div>
    </div>
    <div class="${css.dividerClasses}">
      ${text}
    </div>
    <div class="mt-2 text-center text-xs text-gray-500">
      ${progress}% Complete
    </div>
  </div>`;
};

/**
 * Generate enhanced master heading with phase badge
 */
export const generateEnhancedMasterHeading = (title, phase) => {
  const badge = generatePhaseBadgeHTML(phase);
  const heading = generateMasterHeadingHTML(title, phase);
  return `${badge}\n${heading}`;
};

/**
 * Get phase transition text
 */
export const getPhaseTransitionText = (currentPhase, nextPhase) => {
  const currentCSS = getPhaseCSS(currentPhase);
  const nextCSS = getPhaseCSS(nextPhase);
  return `${currentCSS.phaseLabel} → ${nextCSS.phaseLabel}`;
};

/**
 * Get all phase CSS for iteration
 */
export const getAllPhaseCSS = () => {
  return Object.entries(ADDIE_PHASE_CSS).map(([phase, css]) => ({
    phase,
    ...css,
  }));
};

/**
 * Validate phase name
 */
export const isValidPhase = phase => {
  return phase in ADDIE_PHASE_CSS;
};

/**
 * Get phase index (for ordering)
 */
export const getPhaseIndex = phase => {
  const phases = [
    'analysis',
    'objectives',
    'design',
    'experience',
    'development',
    'implementation',
    'quality',
  ];
  return phases.indexOf(phase);
};

/**
 * Get next phase
 */
export const getNextPhase = currentPhase => {
  const phases = [
    'analysis',
    'objectives',
    'design',
    'experience',
    'development',
    'implementation',
    'quality',
  ];
  const currentIndex = phases.indexOf(currentPhase);
  return currentIndex < phases.length - 1
    ? phases[currentIndex + 1]
    : 'complete';
};

/**
 * Get previous phase
 */
export const getPreviousPhase = currentPhase => {
  const phases = [
    'analysis',
    'objectives',
    'design',
    'experience',
    'development',
    'implementation',
    'quality',
  ];
  const currentIndex = phases.indexOf(currentPhase);
  return currentIndex > 0 ? phases[currentIndex - 1] : 'start';
};

export default {
  ADDIE_PHASE_CSS,
  BLOCK_TYPE_GRADIENTS,
  getPhaseCSS,
  getBlockGradient,
  generateMasterHeadingHTML,
  generatePhaseBadgeHTML,
  generateContentBlockHTML,
  generateDividerHTML,
  generateEnhancedMasterHeading,
  getPhaseTransitionText,
  getAllPhaseCSS,
  isValidPhase,
  getPhaseIndex,
  getNextPhase,
  getPreviousPhase,
};
