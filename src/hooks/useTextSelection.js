import { useState, useEffect, useCallback } from 'react';

const useTextSelection = (quillRef) => {
  const [selection, setSelection] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Update undo/redo state
  const updateUndoRedoState = useCallback(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      setCanUndo(quill.history.canUndo());
      setCanRedo(quill.history.canRedo());
    }
  }, [quillRef]);

  // Handle text selection
  const handleSelectionChange = useCallback(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range && range.length > 0) {
        setSelection(window.getSelection());
      } else {
        setSelection(null);
      }
      updateUndoRedoState();
    }
  }, [quillRef, updateUndoRedoState]);

  // Format text
  const formatText = useCallback((format) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      
      if (range && range.length > 0) {
        switch (format) {
          case 'bold':
            quill.format('bold', !quill.getFormat(range.index, range.length).bold);
            break;
          case 'italic':
            quill.format('italic', !quill.getFormat(range.index, range.length).italic);
            break;
          case 'underline':
            quill.format('underline', !quill.getFormat(range.index, range.length).underline);
            break;
          case 'strikethrough':
            quill.format('strike', !quill.getFormat(range.index, range.length).strike);
            break;
          case 'blockquote':
            quill.format('blockquote', !quill.getFormat(range.index, range.length).blockquote);
            break;
          case 'code':
            quill.format('code-block', !quill.getFormat(range.index, range.length)['code-block']);
            break;
          default:
            break;
        }
        updateUndoRedoState();
      }
    }
  }, [quillRef, updateUndoRedoState]);

  // Change font family
  const changeFontFamily = useCallback((fontFamily) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      
      if (range && range.length > 0) {
        quill.format('font', fontFamily);
        updateUndoRedoState();
      }
    }
  }, [quillRef, updateUndoRedoState]);

  // Change font size
  const changeFontSize = useCallback((fontSize) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      
      if (range && range.length > 0) {
        quill.format('size', fontSize);
        updateUndoRedoState();
      }
    }
  }, [quillRef, updateUndoRedoState]);

  // Change text color
  const changeTextColor = useCallback((color) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      
      if (range && range.length > 0) {
        quill.format('color', color);
        updateUndoRedoState();
      }
    }
  }, [quillRef, updateUndoRedoState]);

  // Change background color
  const changeBackgroundColor = useCallback((color) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      
      if (range && range.length > 0) {
        quill.format('background', color);
        updateUndoRedoState();
      }
    }
  }, [quillRef, updateUndoRedoState]);

  // Align text
  const alignText = useCallback((alignment) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      
      if (range && range.length > 0) {
        quill.format('align', alignment);
        updateUndoRedoState();
      }
    }
  }, [quillRef, updateUndoRedoState]);

  // Create list
  const createList = useCallback((listType) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      
      if (range && range.length > 0) {
        if (listType === 'bullet') {
          quill.format('list', 'bullet');
        } else if (listType === 'ordered') {
          quill.format('list', 'ordered');
        }
        updateUndoRedoState();
      }
    }
  }, [quillRef, updateUndoRedoState]);

  // Insert link
  const insertLink = useCallback(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      
      if (range && range.length > 0) {
        const url = prompt('Enter URL:');
        if (url) {
          quill.format('link', url);
          updateUndoRedoState();
        }
      }
    }
  }, [quillRef, updateUndoRedoState]);

  // Insert image
  const insertImage = useCallback(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      
      const url = prompt('Enter image URL:');
      if (url) {
        const index = range ? range.index : quill.getLength();
        quill.insertEmbed(index, 'image', url);
        updateUndoRedoState();
      }
    }
  }, [quillRef, updateUndoRedoState]);

  // Undo
  const undo = useCallback(() => {
    if (quillRef.current && canUndo) {
      const quill = quillRef.current.getEditor();
      quill.history.undo();
      updateUndoRedoState();
    }
  }, [quillRef, canUndo, updateUndoRedoState]);

  // Redo
  const redo = useCallback(() => {
    if (quillRef.current && canRedo) {
      const quill = quillRef.current.getEditor();
      quill.history.redo();
      updateUndoRedoState();
    }
  }, [quillRef, canRedo, updateUndoRedoState]);

  // Set up event listeners
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      
      // Listen for selection changes
      quill.on('selection-change', handleSelectionChange);
      
      // Listen for text changes to update undo/redo state
      quill.on('text-change', updateUndoRedoState);
      
      return () => {
        quill.off('selection-change', handleSelectionChange);
        quill.off('text-change', updateUndoRedoState);
      };
    }
  }, [quillRef, handleSelectionChange, updateUndoRedoState]);

  return {
    selection,
    canUndo,
    canRedo,
    formatText,
    changeFontFamily,
    changeFontSize,
    changeTextColor,
    changeBackgroundColor,
    alignText,
    createList,
    insertLink,
    insertImage,
    undo,
    redo
  };
};

export default useTextSelection;
