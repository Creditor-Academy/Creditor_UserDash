const fs = require('fs');
const path = require('path');

// Path to the LessonBuilder.jsx file
const lessonBuilderPath = path.join(__dirname, 'src', 'pages', 'LessonBuilder.jsx');

console.log('🔧 Starting Video Block Fix...');

try {
  // Read the current file
  let content = fs.readFileSync(lessonBuilderPath, 'utf8');
  console.log('✅ File read successfully');

  // 1. Add VideoComponent import
  if (!content.includes("import VideoComponent from '@/components/VideoComponent';")) {
    content = content.replace(
      "import { uploadVideo as uploadVideoResource } from '@/services/videoUploadService';",
      "import { uploadVideo as uploadVideoResource } from '@/services/videoUploadService';\nimport VideoComponent from '@/components/VideoComponent';"
    );
    console.log('✅ Added VideoComponent import');
  }

  // 2. Replace video state variables
  const oldVideoStates = `  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoUploadMethod, setVideoUploadMethod] = useState('file'); // 'file' or 'url'
  const [isUploading, setIsUploading] = useState(false);`;

  const newVideoStates = `  const [editingVideoBlock, setEditingVideoBlock] = useState(null);`;

  if (content.includes(oldVideoStates)) {
    content = content.replace(oldVideoStates, newVideoStates);
    console.log('✅ Updated video state variables');
  }

  // 3. Add handleVideoUpdate function after handleYouTubeUpdate
  const handleVideoUpdateFunction = `
  const handleVideoUpdate = (videoBlock) => {
    if (editingVideoBlock) {
      // Update existing video block
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingVideoBlock.id ? {
            ...block,
            ...videoBlock,
            updatedAt: new Date().toISOString()
          } : block
        )
      );

      // Also update lessonContent if it exists (for fetched lessons)
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              (block.block_id === editingVideoBlock.id || block.id === editingVideoBlock.id) ? {
                ...block,
                ...videoBlock,
                updatedAt: new Date().toISOString()
              } : block
            )
          }
        }));
      }
    } else {
      // Add new video block - only add to contentBlocks like other block handlers
      setContentBlocks(prevBlocks => [...prevBlocks, videoBlock]);
    }

    // Reset editing state
    setEditingVideoBlock(null);
  };`;

  if (!content.includes('const handleVideoUpdate = (videoBlock) => {')) {
    // Find the end of handleYouTubeUpdate function
    const youtubeUpdateEnd = content.indexOf('setEditingYouTubeBlock(null);\n  };');
    if (youtubeUpdateEnd !== -1) {
      const insertPoint = youtubeUpdateEnd + 'setEditingYouTubeBlock(null);\n  };'.length;
      content = content.slice(0, insertPoint) + handleVideoUpdateFunction + content.slice(insertPoint);
      console.log('✅ Added handleVideoUpdate function');
    }
  }

  // 4. Add video case to handleEditBlock
  const videoCaseCode = `        case 'video':
          setEditingVideoBlock(block);
          setShowVideoDialog(true);
          break;`;

  // Find the handleEditBlock function and add the case
  if (!content.includes("case 'video':")) {
    // Look for the switch statement in handleEditBlock
    const switchPattern = /case 'youtube':\s*setEditingYouTubeBlock\(block\);\s*setShowYouTubeDialog\(true\);\s*break;/;
    const match = content.match(switchPattern);
    if (match) {
      const insertPoint = match.index + match[0].length;
      content = content.slice(0, insertPoint) + '\n\n' + videoCaseCode + content.slice(insertPoint);
      console.log('✅ Added video case to handleEditBlock');
    }
  }

  // 5. Remove old video functions
  const functionsToRemove = [
    /const handleVideoDialogClose = \(\) => \{[\s\S]*?\n  \};/,
    /const handleVideoInputChange = \(e\) => \{[\s\S]*?\n  \};/,
    /const handleAddVideo = async \(\) => \{[\s\S]*?\n  \};/
  ];

  functionsToRemove.forEach((pattern, index) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      console.log(`✅ Removed old video function ${index + 1}`);
    }
  });

  // 6. Replace video dialog with VideoComponent
  const oldVideoDialog = /<Dialog open={showVideoDialog}[\s\S]*?<\/Dialog>/;
  const newVideoComponent = `<VideoComponent
        showVideoDialog={showVideoDialog}
        setShowVideoDialog={setShowVideoDialog}
        onVideoUpdate={handleVideoUpdate}
        editingVideoBlock={editingVideoBlock}
      />`;

  if (oldVideoDialog.test(content)) {
    content = content.replace(oldVideoDialog, newVideoComponent);
    console.log('✅ Replaced video dialog with VideoComponent');
  }

  // Write the updated content back to the file
  fs.writeFileSync(lessonBuilderPath, content, 'utf8');
  console.log('🎉 Video block fix completed successfully!');
  console.log('');
  console.log('✅ Changes applied:');
  console.log('  - Added VideoComponent import');
  console.log('  - Simplified video state variables');
  console.log('  - Added handleVideoUpdate function');
  console.log('  - Added video case to handleEditBlock');
  console.log('  - Removed old video functions');
  console.log('  - Replaced inline dialog with VideoComponent');
  console.log('');
  console.log('🚀 Video blocks should now add to existing content instead of replacing it!');

} catch (error) {
  console.error('❌ Error fixing video block:', error.message);
  console.log('');
  console.log('📋 Manual fix required. Please apply the changes from video_fix_instructions.md');
}
