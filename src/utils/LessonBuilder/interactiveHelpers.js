// Initialize global functions for interactive components
export const initializeGlobalFunctions = () => {
  // Tab switching function
  window.switchTab = function (containerId, activeIndex) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tabButtons = container.querySelectorAll('.tab-button');
    const tabPanels = container.querySelectorAll('.tab-panel');

    tabButtons.forEach((button, index) => {
      if (index === activeIndex) {
        button.classList.add(
          'border-b-2',
          'border-blue-500',
          'text-blue-600',
          'bg-blue-50'
        );
        button.classList.remove('text-gray-500');
      } else {
        button.classList.remove(
          'border-b-2',
          'border-blue-500',
          'text-blue-600',
          'bg-blue-50'
        );
        button.classList.add('text-gray-500');
      }
    });

    tabPanels.forEach((panel, index) => {
      if (index === activeIndex) {
        panel.classList.remove('hidden');
        panel.classList.add('block');
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('block');
      }
    });
  };

  // Accordion toggle function
  window.toggleAccordion = function (containerId, index) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const content = container.querySelector(`[data-content="${index}"]`);
    const icon = container.querySelector(`[data-icon="${index}"]`);

    if (!content || !icon) return;

    if (content.classList.contains('max-h-0')) {
      content.classList.remove('max-h-0');
      content.classList.add('max-h-96', 'pb-4');
      icon.classList.add('rotate-180');
    } else {
      content.classList.add('max-h-0');
      content.classList.remove('max-h-96', 'pb-4');
      icon.classList.remove('rotate-180');
    }
  };

  // Labeled Graphic functions
  window.toggleHotspotContent = function (containerId, hotspotId) {
    // Hide all other content overlays in this container
    const container = document.getElementById(containerId);
    if (container) {
      const allContents = container.querySelectorAll('.hotspot-content');
      allContents.forEach(content => {
        if (content.id !== 'content-' + containerId + '-' + hotspotId) {
          content.classList.add('hidden');
        }
      });
    }

    // Toggle the clicked hotspot content
    const contentElement = document.getElementById(
      'content-' + containerId + '-' + hotspotId
    );
    if (contentElement) {
      if (contentElement.classList.contains('hidden')) {
        contentElement.classList.remove('hidden');
        // Add fade-in animation
        contentElement.style.opacity = '0';
        contentElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
          contentElement.style.transition =
            'opacity 0.3s ease, transform 0.3s ease';
          contentElement.style.opacity = '1';
          contentElement.style.transform = 'scale(1)';
        }, 10);
      } else {
        contentElement.classList.add('hidden');
      }
    }
  };

  window.hideHotspotContent = function (containerId, hotspotId) {
    const contentElement = document.getElementById(
      'content-' + containerId + '-' + hotspotId
    );
    if (contentElement) {
      contentElement.style.transition =
        'opacity 0.2s ease, transform 0.2s ease';
      contentElement.style.opacity = '0';
      contentElement.style.transform = 'scale(0.9)';
      setTimeout(() => {
        contentElement.classList.add('hidden');
      }, 200);
    }
  };

  // Close hotspot content when clicking outside (only add once)
  if (!window.labeledGraphicClickHandler) {
    window.labeledGraphicClickHandler = function (event) {
      if (
        !event.target.closest('.hotspot') &&
        !event.target.closest('.hotspot-content')
      ) {
        const allContents = document.querySelectorAll('.hotspot-content');
        allContents.forEach(content => {
          content.classList.add('hidden');
        });
      }
    };
    document.addEventListener('click', window.labeledGraphicClickHandler);
  }
};
