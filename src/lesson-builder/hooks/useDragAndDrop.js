import { useState } from 'react';

/**
 * Hook to handle drag and drop functionality for content blocks
 * Extracts lines 2243-2365 from original LessonBuilder.jsx
 */
export const useDragAndDrop = (
  contentBlocks,
  setContentBlocks,
  lessonContent,
  setLessonContent
) => {
  const [draggedBlockId, setDraggedBlockId] = useState(null);

  const handleDragStart = (e, blockId) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';

    const element = e.target;
    element.classList.add('dragging');

    const ghost = element.cloneNode(true);
    ghost.style.opacity = '0.5';
    ghost.style.position = 'absolute';
    ghost.style.left = '-9999px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);

    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  const handleDragEnd = () => {
    document.querySelectorAll('[data-block-id]').forEach(block => {
      block.style.transform = '';
      block.classList.remove('dragging');
    });
    setDraggedBlockId(null);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const draggedElement = document.querySelector(
      `[data-block-id="${draggedBlockId}"]`
    );
    if (!draggedElement) return;

    const dropTarget = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest('[data-block-id]');
    if (!dropTarget || dropTarget === draggedElement) return;

    const blocks = Array.from(document.querySelectorAll('[data-block-id]'));
    const draggedIndex = blocks.indexOf(draggedElement);
    const dropIndex = blocks.indexOf(dropTarget);

    blocks.forEach(block => {
      if (block !== draggedElement) {
        block.style.transform = '';
      }
    });

    const moveUp = draggedIndex > dropIndex;
    dropTarget.style.transform = `translateY(${moveUp ? '40px' : '-40px'})`;
    dropTarget.style.transition = 'transform 0.2s ease';
  };

  const handleDrop = (e, targetBlockId) => {
    e.preventDefault();
    if (draggedBlockId === null || draggedBlockId === targetBlockId) return;

    if (lessonContent?.data?.content && lessonContent.data.content.length > 0) {
      const content = lessonContent.data.content;
      const sourceIndex = content.findIndex(
        b => (b.block_id || b.id) === draggedBlockId
      );
      const targetIndex = content.findIndex(
        b => (b.block_id || b.id) === targetBlockId
      );

      if (sourceIndex === -1 || targetIndex === -1) return;

      const updatedContent = [...content];
      const [moved] = updatedContent.splice(sourceIndex, 1);
      updatedContent.splice(targetIndex, 0, moved);

      setLessonContent({
        ...lessonContent,
        data: {
          ...lessonContent.data,
          content: updatedContent.map((block, index) => ({
            ...block,
            order: index + 1,
          })),
        },
      });
    } else {
      const sourceIndex = contentBlocks.findIndex(
        b => (b.id || b.block_id) === draggedBlockId
      );
      const targetIndex = contentBlocks.findIndex(
        b => (b.id || b.block_id) === targetBlockId
      );

      if (sourceIndex === -1 || targetIndex === -1) return;

      const updatedBlocks = [...contentBlocks];
      const [moved] = updatedBlocks.splice(sourceIndex, 1);
      updatedBlocks.splice(targetIndex, 0, moved);

      setContentBlocks(updatedBlocks);
    }

    setDraggedBlockId(null);

    document.querySelectorAll('[data-block-id]').forEach(block => {
      block.style.transform = '';
      block.style.transition = '';
    });
  };

  return {
    draggedBlockId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
};
