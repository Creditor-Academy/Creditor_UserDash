import { useCallback, useEffect, useRef } from 'react';

const useLessonAutosave = ({
  lessonId,
  contentBlocks,
  lessonContent,
  loading,
  fetchingContent,
  handleUpdate,
  setAutoSaveStatus,
  setHasUnsavedChanges,
}) => {
  const prevContentBlocksRef = useRef([]);
  const prevLessonContentRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const autoSaveTimeoutRef = useRef(null);
  const handleUpdateRef = useRef(handleUpdate);

  useEffect(() => {
    handleUpdateRef.current = handleUpdate;
  }, [handleUpdate]);

  const debouncedAutoSave = useCallback(
    content => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(async () => {
        if (!lessonId || !content || content.length === 0) {
          return;
        }

        try {
          console.log('💾 Auto-save executing for', content.length, 'blocks');
          setAutoSaveStatus('saving');
          await handleUpdateRef.current();
        } catch (error) {
          console.error('❌ Auto-save failed:', error);
        }
      }, 2000);
    },
    [lessonId]
  );

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loading || fetchingContent) return;

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      prevContentBlocksRef.current = [...contentBlocks];
      prevLessonContentRef.current = lessonContent
        ? JSON.parse(JSON.stringify(lessonContent))
        : null;
      return;
    }

    const contentBlocksChanged =
      JSON.stringify(prevContentBlocksRef.current) !==
      JSON.stringify(contentBlocks);

    const lessonContentChanged =
      JSON.stringify(prevLessonContentRef.current) !==
      JSON.stringify(lessonContent);

    const hasChanged = contentBlocksChanged || lessonContentChanged;

    if (hasChanged && contentBlocks.length > 0) {
      const changedBlocks = contentBlocks.filter((block, index) => {
        const prevBlock = prevContentBlocksRef.current[index];
        if (!prevBlock) return true;
        return JSON.stringify(prevBlock) !== JSON.stringify(block);
      });

      console.log('🔄 Auto-save triggered:', {
        contentBlocksChanged,
        lessonContentChanged,
        totalBlocks: contentBlocks.length,
        previousBlocks: prevContentBlocksRef.current.length,
        changedBlocks: changedBlocks.map(b => ({
          id: b.id || b.block_id,
          type: b.type,
          textType: b.textType,
          hasContent: !!b.content,
          hasHtmlCss: !!b.html_css,
        })),
        blockTypes: contentBlocks.map(b => b.type),
        source: lessonContent?.data?.content
          ? 'lessonContent'
          : 'contentBlocks',
      });

      setHasUnsavedChanges(true);
      debouncedAutoSave(contentBlocks);
      prevContentBlocksRef.current = [...contentBlocks];
      prevLessonContentRef.current = lessonContent
        ? JSON.parse(JSON.stringify(lessonContent))
        : null;
    }
  }, [
    contentBlocks,
    lessonContent,
    loading,
    fetchingContent,
    debouncedAutoSave,
  ]);
};

export default useLessonAutosave;
