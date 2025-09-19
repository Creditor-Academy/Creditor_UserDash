import React, { useContext } from 'react';
import { SidebarContext } from '@/layouts/DashboardLayout';

// Import refactored components
import LessonHeader from '@/components/LessonBuilder/LessonHeader';
import ContentLibrary from '@/components/LessonBuilder/ContentBlocks/ContentLibrary';
import TextTypeSidebar from '@/components/LessonBuilder/Sidebars/TextTypeSidebar';
import TextEditor from '@/components/LessonBuilder/ContentBlocks/TextBlocks/TextEditor';
import AIEnhancementPanel from '@/components/LessonBuilder/AIEnhancementPanel';

// Import hooks and utilities
import { useLessonBuilder } from './hooks/useLessonBuilder';
import { injectStyles } from '@/utils/LessonBuilder/styleSheets';

// Import existing components that need to be extracted later
import QuoteComponent from '@/components/QuoteComponent';
import TableComponent from '@/components/TableComponent';
import StatementComponent from '@/components/statement';

// Inject custom styles
injectStyles();

function LessonBuilder() {
  const { sidebarCollapsed, setSidebarCollapsed } = useContext(SidebarContext);
  
  // Use our custom hook for state management
  const {
    // Core state
    contentBlocks,
    lessonTitle,
    lessonData,
    isUploading,
    
    // Modal states
    showTextTypeSidebar,
    setShowTextTypeSidebar,
    showTextEditorDialog,
    setShowTextEditorDialog,
    showAIEnhancementPanel,
    setShowAIEnhancementPanel,
    showUnifiedPreview,
    setShowUnifiedPreview,
    
    // Text editor states
    editorHtml,
    setEditorHtml,
    editorHeading,
    setEditorHeading,
    editorSubheading,
    setEditorSubheading,
    editorContent,
    setEditorContent,
    currentTextBlockId,
    currentTextType,
    
    // Functions
    handleTextTypeSelect,
    convertToUnifiedFormatWrapper,
    handleBlockUpdate,
    handleView,
    handleBack,
    
    // Refs
    statementComponentRef
  } = useLessonBuilder();

  // Block click handler
  const handleBlockClick = (blockType) => {
    if (blockType.id === 'text') {
      setShowTextTypeSidebar(true);
    } else if (blockType.id === 'statement') {
      // setShowStatementSidebar(true);
    } else if (blockType.id === 'quote') {
      // setShowQuoteTemplateSidebar(true);
    } else if (blockType.id === 'video') {
      // setShowVideoDialog(true);
    } else if (blockType.id === 'image') {
      // setShowImageTemplateSidebar(true);
    } else if (blockType.id === 'tables') {
      // setShowTableComponent(true);
    } else if (blockType.id === 'audio') {
      // setShowAudioDialog(true);
    } else if (blockType.id === 'youtube') {
      // setShowYoutubeDialog(true);
    } else if (blockType.id === 'link') {
      // setShowLinkDialog(true);
    } else if (blockType.id === 'pdf') {
      // setShowPdfDialog(true);
    } else {
      // addContentBlock(blockType);
    }
  };

  // Placeholder functions for save and update
  const handleSave = () => {
    console.log('Save as draft');
    // TODO: Implement save functionality
  };

  const handleUpdate = () => {
    console.log('Update lesson');
    // TODO: Implement update functionality
  };

  const handleAIEnhance = () => {
    setShowAIEnhancementPanel(true);
  };

  const handleAIContentGenerated = (content) => {
    console.log('AI generated content:', content);
    // TODO: Implement content insertion logic
    // For now, just close the panel
    setShowAIEnhancementPanel(false);
  };

  const handleTextEditorSave = () => {
    console.log('Save text editor');
    // TODO: Implement text editor save functionality
    setShowTextEditorDialog(false);
  };

  return (
    <>
      <div className="flex min-h-screen w-full bg-white overflow-hidden">
        {/* Content Blocks Sidebar */}
        <ContentLibrary 
          onBlockClick={handleBlockClick}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Text Type Sidebar */}
        <TextTypeSidebar
          isOpen={showTextTypeSidebar}
          onTextTypeSelect={handleTextTypeSelect}
          onClose={() => {
            setShowTextTypeSidebar(false);
            setSidebarCollapsed(true);
          }}
        />

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 relative ${
            sidebarCollapsed
              ? 'ml-[calc(4.5rem+16rem)]'
              : 'ml-[calc(17rem+16rem)]'
          }`}
        >
          <div className="w-full h-full bg-[#fafafa]">
            {/* Lesson Builder Header */}
            <LessonHeader
              lessonTitle={lessonTitle}
              lessonData={lessonData}
              onBack={handleBack}
              onView={handleView}
              onSave={handleSave}
              onUpdate={handleUpdate}
              isUploading={isUploading}
              onAIEnhance={handleAIEnhance}
            />

            {/* Main Content Canvas */}
            <div className="py-4">
              <div>
                {/* Always show edit interface since View button now opens modern preview */}
                {contentBlocks.length === 0 ? (
                  <div className="max-w-2xl mx-auto text-center py-12">
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        No Content Available
                      </h3>
                      <p className="text-gray-500 mb-6">
                        This lesson doesn't have any content yet. Start building your lesson by adding content blocks from the Content Library.
                      </p>
                    </div>
                   
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        💡 Getting Started
                      </h4>
                      <p className="text-sm text-blue-700 mb-4">
                        Use the <strong>Content Library</strong> on the left to add text, images, videos, and other interactive elements to your lesson.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-3xl mx-auto">
                    {contentBlocks.map((block) => (
                      <div
                        key={block.id}
                        className="relative group bg-white rounded-lg"
                      >
                        <div className="p-6">
                          {block.type === 'text' && (
                            <div className="mb-8">
                              {block.html_css ? (
                                <div
                                  className="max-w-none"
                                  dangerouslySetInnerHTML={{ __html: block.html_css }}
                                />
                              ) : (
                                <div
                                  className="max-w-none text-gray-800 leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: block.content }}
                                />
                              )}
                            </div>
                          )}
                          {/* TODO: Add other block type renderers */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text Editor Dialog */}
      <TextEditor
        isOpen={showTextEditorDialog}
        onClose={() => setShowTextEditorDialog(false)}
        currentTextBlockId={currentTextBlockId}
        currentTextType={currentTextType}
        editorHtml={editorHtml}
        editorHeading={editorHeading}
        editorSubheading={editorSubheading}
        editorContent={editorContent}
        onEditorHtmlChange={setEditorHtml}
        onEditorHeadingChange={setEditorHeading}
        onEditorSubheadingChange={setEditorSubheading}
        onEditorContentChange={setEditorContent}
        onSave={handleTextEditorSave}
        contentBlocks={contentBlocks}
      />

      {/* Modern Lesson Preview Modal - Disabled */}
      {showUnifiedPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-4">Lesson Preview Disabled</h3>
            <p className="text-gray-600 mb-4">Modern lesson preview functionality has been removed.</p>
            <button 
              onClick={() => setShowUnifiedPreview(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Existing components that need to be refactored later */}
      <QuoteComponent
        ref={statementComponentRef}
        onQuoteSelect={() => {}}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <TableComponent
        onTableSelect={() => {}}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <StatementComponent
        ref={statementComponentRef}
        onStatementSelect={() => {}}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* AI Enhancement Panel */}
      <AIEnhancementPanel
        lessonData={lessonData}
        onContentGenerated={handleAIContentGenerated}
        isOpen={showAIEnhancementPanel}
        onClose={() => setShowAIEnhancementPanel(false)}
      />
    </>
  );
}

export default LessonBuilder;