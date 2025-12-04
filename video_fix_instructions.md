# Video Block Fix Instructions

## Problem

The video block is replacing all content instead of adding to existing content like other blocks (audio, YouTube, etc.).

## Root Cause

The video block uses a different pattern than audio/YouTube blocks:

- Audio/YouTube: Use separate components with `handleAudioUpdate`/`handleYouTubeUpdate`
- Video: Uses inline dialog with `handleAddVideo` function

## Required Changes

### 1. Update State Variables (around line 528-535)

**Replace these lines:**

```javascript
const [videoTitle, setVideoTitle] = useState('');
const [videoDescription, setVideoDescription] = useState('');
const [videoFile, setVideoFile] = useState(null);
const [videoPreview, setVideoPreview] = useState('');
const [videoUrl, setVideoUrl] = useState('');
const [videoUploadMethod, setVideoUploadMethod] = useState('file'); // 'file' or 'url'
const [isUploading, setIsUploading] = useState(false);
```

**With:**

```javascript
const [editingVideoBlock, setEditingVideoBlock] = useState(null);
```

### 2. Add handleVideoUpdate Function (after line 1744)

**Add this function after `handleYouTubeUpdate`:**

```javascript
const handleVideoUpdate = videoBlock => {
  if (editingVideoBlock) {
    // Update existing video block
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === editingVideoBlock.id
          ? {
              ...block,
              ...videoBlock,
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    // Also update lessonContent if it exists (for fetched lessons)
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === editingVideoBlock.id ||
            block.id === editingVideoBlock.id
              ? {
                  ...block,
                  ...videoBlock,
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }
  } else {
    // Add new video block - only add to contentBlocks like other block handlers
    setContentBlocks(prevBlocks => [...prevBlocks, videoBlock]);
  }

  // Reset editing state
  setEditingVideoBlock(null);
};
```

### 3. Update handleEditBlock Function (around line 1395-1429)

**Add video case in the switch statement:**

```javascript
case 'video':
  setEditingVideoBlock(block);
  setShowVideoDialog(true);
  break;
```

### 4. Remove Old Video Functions

**Delete these functions (around lines 3570-3712):**

- `handleVideoDialogClose`
- `handleVideoInputChange`
- `handleAddVideo`

### 5. Replace Inline Video Dialog (around lines 6359-6500)

**Replace the entire video Dialog section with:**

```javascript
<VideoComponent
  showVideoDialog={showVideoDialog}
  setShowVideoDialog={setShowVideoDialog}
  onVideoUpdate={handleVideoUpdate}
  editingVideoBlock={editingVideoBlock}
/>
```

## Expected Result

After these changes:

- Video blocks will add to existing content instead of replacing it
- Video blocks will follow the same pattern as audio/YouTube blocks
- Video upload will work consistently with other media blocks
- Content will be preserved when adding videos

## Files Already Created

- ✅ `VideoComponent.jsx` - Already created and ready to use
- ✅ Follows the same pattern as `AudioComponent.jsx`
