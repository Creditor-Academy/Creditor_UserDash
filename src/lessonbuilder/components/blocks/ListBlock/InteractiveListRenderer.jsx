import React from 'react';
import devLogger from '@lessonbuilder/utils/devLogger';

// Interactive List Renderer Component for checkbox lists
const InteractiveListRenderer = ({ block, onCheckboxToggle }) => {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    devLogger.debug(
      'InteractiveListRenderer useEffect triggered for block:',
      block.id
    );
    if (!containerRef.current) {
      devLogger.debug('No containerRef.current found');
      return;
    }

    const handleCheckboxClick = e => {
      e.preventDefault();
      e.stopPropagation();

      devLogger.debug('Checkbox click detected:', e.target);

      // Find the checkbox container - could be the clicked element or a parent
      let checkboxContainer = e.target.closest('.checkbox-container');

      // If not found, try looking for checkbox wrapper or checkbox item
      if (!checkboxContainer) {
        const checkboxWrapper = e.target.closest('.checkbox-wrapper');
        if (checkboxWrapper) {
          checkboxContainer = checkboxWrapper.closest('.checkbox-container');
        }
      }

      if (!checkboxContainer) {
        devLogger.debug('No checkbox-container found');
        return;
      }

      const itemIndex = parseInt(checkboxContainer.dataset.index);
      const hiddenCheckbox = checkboxContainer.querySelector('.checkbox-item');
      const visualCheckbox =
        checkboxContainer.querySelector('.checkbox-visual');
      const textElement = checkboxContainer.querySelector('.flex-1');

      devLogger.debug('Checkbox elements found:', {
        itemIndex,
        hiddenCheckbox: !!hiddenCheckbox,
        visualCheckbox: !!visualCheckbox,
        textElement: !!textElement,
      });

      if (hiddenCheckbox && visualCheckbox) {
        const newChecked = !hiddenCheckbox.checked;

        // Update visual state immediately for better UX
        if (newChecked) {
          visualCheckbox.classList.remove('opacity-0');
          visualCheckbox.classList.add('opacity-100');
          if (textElement) {
            textElement.classList.add('line-through', 'text-gray-500');
          }
        } else {
          visualCheckbox.classList.remove('opacity-100');
          visualCheckbox.classList.add('opacity-0');
          if (textElement) {
            textElement.classList.remove('line-through', 'text-gray-500');
          }
        }

        devLogger.debug('Calling onCheckboxToggle:', {
          blockId: block.id || block.block_id,
          itemIndex,
          newChecked,
        });

        // Call the callback to update the block state
        onCheckboxToggle(block.id || block.block_id, itemIndex, newChecked);
      }
    };

    // Add click event listeners to all checkbox containers and their children
    const checkboxContainers = containerRef.current.querySelectorAll(
      '.checkbox-container'
    );
    const checkboxWrappers =
      containerRef.current.querySelectorAll('.checkbox-wrapper');

    devLogger.debug('Found checkbox containers:', checkboxContainers.length);
    devLogger.debug('Found checkbox wrappers:', checkboxWrappers.length);

    // Add listeners to containers
    checkboxContainers.forEach((container, index) => {
      devLogger.debug(`Adding listener to container ${index}:`, container);
      container.addEventListener('click', handleCheckboxClick);
    });

    // Add listeners to wrappers for more precise clicking
    checkboxWrappers.forEach((wrapper, index) => {
      devLogger.debug(`Adding listener to wrapper ${index}:`, wrapper);
      wrapper.addEventListener('click', handleCheckboxClick);
    });

    // Cleanup
    return () => {
      checkboxContainers.forEach(container => {
        container.removeEventListener('click', handleCheckboxClick);
      });
      checkboxWrappers.forEach(wrapper => {
        wrapper.removeEventListener('click', handleCheckboxClick);
      });
    };
  }, [block.html_css, onCheckboxToggle, block.id, block.block_id]);

  devLogger.debug(
    'InteractiveListRenderer rendering with HTML:',
    block.html_css?.substring(0, 200)
  );

  return (
    <div
      ref={containerRef}
      className="max-w-none"
      dangerouslySetInnerHTML={{ __html: block.html_css }}
    />
  );
};

export default InteractiveListRenderer;
