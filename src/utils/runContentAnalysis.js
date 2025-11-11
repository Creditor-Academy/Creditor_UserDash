import {
  generateUsageReport,
  getBlockUsageDetails,
  analyzeContentLibraryUsage,
  AVAILABLE_BLOCKS,
  CURRENTLY_USED_BLOCKS,
} from './contentLibraryAnalyzer.js';

/**
 * Run complete content library analysis
 */
export function runCompleteAnalysis() {
  console.log('🔍 RUNNING COMPLETE CONTENT LIBRARY ANALYSIS');
  console.log('='.repeat(60));

  // Generate full usage report
  const analysis = generateUsageReport();

  console.log('\n📊 DETAILED BREAKDOWN BY BLOCK TYPE:');
  console.log('='.repeat(60));

  // Show detailed breakdown for each block
  Object.keys(AVAILABLE_BLOCKS).forEach(blockId => {
    const details = getBlockUsageDetails(blockId);
    const status = details.isUsed ? '✅ USED' : '❌ UNUSED';

    console.log(`\n${status} - ${details.blockName.toUpperCase()}`);
    console.log(`   Total Variants: ${details.totalVariants}`);
    console.log(
      `   Used Variants: ${details.usedVariants.length} (${details.usagePercentage}%)`
    );

    if (details.usedVariants.length > 0) {
      console.log(`   ✅ Using: ${details.usedVariants.join(', ')}`);
    }

    if (details.unusedVariants.length > 0) {
      console.log(`   ❌ Missing: ${details.unusedVariants.join(', ')}`);
    }
  });

  return analysis;
}

/**
 * Show image block specific analysis
 */
export function analyzeImageBlockUsage() {
  console.log('\n🖼️  IMAGE BLOCK DETAILED ANALYSIS');
  console.log('='.repeat(40));

  const imageDetails = getBlockUsageDetails('image');

  console.log(`📊 Image Block Usage: ${imageDetails.usagePercentage}%`);
  console.log(`📈 Variants Available: ${imageDetails.totalVariants}`);
  console.log(`✅ Currently Using: ${imageDetails.usedVariants.join(', ')}`);
  console.log(`❌ Not Using: ${imageDetails.unusedVariants.join(', ')}`);

  console.log('\n💡 Image Variant Details:');
  console.log('   ✅ centered - Used for first image in each lesson');
  console.log('   ✅ overlay - Used for second image in each lesson');
  console.log('   ❌ side-by-side - Could be used for comparison images');
  console.log('   ❌ full-width - Could be used for hero/banner images');

  return imageDetails;
}

/**
 * Show unused blocks analysis
 */
export function analyzeUnusedBlocks() {
  console.log('\n❌ COMPLETELY UNUSED BLOCKS ANALYSIS');
  console.log('='.repeat(50));

  const unusedBlocks = Object.keys(CURRENTLY_USED_BLOCKS).filter(
    blockId => !CURRENTLY_USED_BLOCKS[blockId].used
  );

  console.log(`📊 Total Unused Blocks: ${unusedBlocks.length}/13`);
  console.log(
    `📈 Potential Variants Lost: ${unusedBlocks.reduce((total, blockId) => {
      return total + AVAILABLE_BLOCKS[blockId].totalVariants;
    }, 0)}`
  );

  console.log('\n📋 Unused Blocks & Their Potential:');
  unusedBlocks.forEach(blockId => {
    const block = AVAILABLE_BLOCKS[blockId];
    console.log(
      `   ❌ ${block.name}: ${block.totalVariants} variants available`
    );
    console.log(`      Variants: ${block.variants.join(', ')}`);
  });

  return unusedBlocks;
}

/**
 * Generate enhancement recommendations
 */
export function generateEnhancementPlan() {
  console.log('\n🚀 ENHANCEMENT RECOMMENDATIONS');
  console.log('='.repeat(40));

  const analysis = analyzeContentLibraryUsage();

  console.log('🎯 Priority 1 - Add Missing Media Blocks:');
  console.log('   • Video blocks for tutorial content');
  console.log('   • Audio blocks for podcasts/narration');
  console.log('   • YouTube blocks for external video content');
  console.log('   • PDF blocks for downloadable resources');

  console.log('\n🎯 Priority 2 - Expand Text Variants:');
  console.log('   • Add heading blocks for section titles');
  console.log('   • Add subheading blocks for subsections');
  console.log('   • Use heading_paragraph combinations');

  console.log('\n🎯 Priority 3 - Diversify Interactive Content:');
  console.log('   • Add code blocks for programming courses');
  console.log('   • Add assessment blocks with scoring');
  console.log('   • Add widget blocks for external tools');

  console.log('\n🎯 Priority 4 - Enhance Visual Variety:');
  console.log('   • Use more quote variants (quote_a, quote_c, quote_d)');
  console.log('   • Add different statement styles (warning, info, highlight)');
  console.log('   • Use all image variants (side-by-side, full-width)');

  console.log('\n🎯 Priority 5 - Add Structured Content:');
  console.log('   • Table blocks for data presentation');
  console.log('   • Link blocks for external resources');
  console.log('   • Different divider styles for section breaks');

  return analysis.recommendations;
}

/**
 * Run specific block analysis
 */
export function analyzeSpecificBlock(blockId) {
  console.log(`\n🔍 ANALYZING ${blockId.toUpperCase()} BLOCK`);
  console.log('='.repeat(30));

  const details = getBlockUsageDetails(blockId);

  if (details.error) {
    console.log(`❌ Error: ${details.error}`);
    return null;
  }

  console.log(`📊 Block: ${details.blockName}`);
  console.log(
    `📈 Usage: ${details.usagePercentage}% (${details.usedVariants.length}/${details.totalVariants})`
  );
  console.log(
    `✅ Used Variants: ${details.usedVariants.length > 0 ? details.usedVariants.join(', ') : 'None'}`
  );
  console.log(
    `❌ Unused Variants: ${details.unusedVariants.length > 0 ? details.unusedVariants.join(', ') : 'None'}`
  );

  return details;
}

// Export all analysis functions
export default {
  runCompleteAnalysis,
  analyzeImageBlockUsage,
  analyzeUnusedBlocks,
  generateEnhancementPlan,
  analyzeSpecificBlock,
};
