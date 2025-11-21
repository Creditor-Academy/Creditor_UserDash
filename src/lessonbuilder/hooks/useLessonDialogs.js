import { useState } from 'react';

const useLessonDialogs = () => {
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [editingVideoBlock, setEditingVideoBlock] = useState(null);
  const [showTextEditorDialog, setShowTextEditorDialog] = useState(false);
  const [currentTextBlockId, setCurrentTextBlockId] = useState(null);
  const [currentTextType, setCurrentTextType] = useState(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [editingLinkBlock, setEditingLinkBlock] = useState(null);
  const [showImageTemplateSidebar, setShowImageTemplateSidebar] =
    useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTextTypeSidebar, setShowTextTypeSidebar] = useState(false);
  const [showStatementSidebar, setShowStatementSidebar] = useState(false);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [editingPdfBlock, setEditingPdfBlock] = useState(null);
  const [showQuoteTemplateSidebar, setShowQuoteTemplateSidebar] =
    useState(false);
  const [showQuoteEditDialog, setShowQuoteEditDialog] = useState(false);
  const [editingQuoteBlock, setEditingQuoteBlock] = useState(null);
  const [showListTemplateSidebar, setShowListTemplateSidebar] = useState(false);
  const [showListEditDialog, setShowListEditDialog] = useState(false);
  const [editingListBlock, setEditingListBlock] = useState(null);
  const [showTableComponent, setShowTableComponent] = useState(false);
  const [editingTableBlock, setEditingTableBlock] = useState(null);
  const [showInteractiveTemplateSidebar, setShowInteractiveTemplateSidebar] =
    useState(false);
  const [showInteractiveEditDialog, setShowInteractiveEditDialog] =
    useState(false);
  const [editingInteractiveBlock, setEditingInteractiveBlock] = useState(null);
  const [showDividerTemplateSidebar, setShowDividerTemplateSidebar] =
    useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [editingAudioBlock, setEditingAudioBlock] = useState(null);
  const [showYouTubeDialog, setShowYouTubeDialog] = useState(false);
  const [editingYouTubeBlock, setEditingYouTubeBlock] = useState(null);
  const [showInsertBlockDialog, setShowInsertBlockDialog] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [editorHeading, setEditorHeading] = useState('');
  const [editorSubheading, setEditorSubheading] = useState('');

  return {
    showVideoDialog,
    setShowVideoDialog,
    editingVideoBlock,
    setEditingVideoBlock,
    showTextEditorDialog,
    setShowTextEditorDialog,
    currentTextBlockId,
    setCurrentTextBlockId,
    currentTextType,
    setCurrentTextType,
    showLinkDialog,
    setShowLinkDialog,
    editingLinkBlock,
    setEditingLinkBlock,
    showImageTemplateSidebar,
    setShowImageTemplateSidebar,
    showImageDialog,
    setShowImageDialog,
    showTextTypeSidebar,
    setShowTextTypeSidebar,
    showStatementSidebar,
    setShowStatementSidebar,
    showPdfDialog,
    setShowPdfDialog,
    editingPdfBlock,
    setEditingPdfBlock,
    showQuoteTemplateSidebar,
    setShowQuoteTemplateSidebar,
    showQuoteEditDialog,
    setShowQuoteEditDialog,
    editingQuoteBlock,
    setEditingQuoteBlock,
    showListTemplateSidebar,
    setShowListTemplateSidebar,
    showListEditDialog,
    setShowListEditDialog,
    editingListBlock,
    setEditingListBlock,
    showTableComponent,
    setShowTableComponent,
    editingTableBlock,
    setEditingTableBlock,
    showInteractiveTemplateSidebar,
    setShowInteractiveTemplateSidebar,
    showInteractiveEditDialog,
    setShowInteractiveEditDialog,
    editingInteractiveBlock,
    setEditingInteractiveBlock,
    showDividerTemplateSidebar,
    setShowDividerTemplateSidebar,
    showAudioDialog,
    setShowAudioDialog,
    editingAudioBlock,
    setEditingAudioBlock,
    showYouTubeDialog,
    setShowYouTubeDialog,
    editingYouTubeBlock,
    setEditingYouTubeBlock,
    showInsertBlockDialog,
    setShowInsertBlockDialog,
    editorContent,
    setEditorContent,
    editorHeading,
    setEditorHeading,
    editorSubheading,
    setEditorSubheading,
  };
};

export default useLessonDialogs;
