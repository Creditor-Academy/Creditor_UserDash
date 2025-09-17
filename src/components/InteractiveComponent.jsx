import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Layers, X, Plus, Trash2, ChevronDown, ChevronRight, Upload, Image as ImageIcon, Volume2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { uploadImage } from '@/services/imageUploadService';
import { uploadAudio as uploadAudioResource } from '@/services/audioUploadService';

const InteractiveComponent = forwardRef(({
  showInteractiveTemplateSidebar,
  setShowInteractiveTemplateSidebar,
  showInteractiveEditDialog,
  setShowInteractiveEditDialog,
  onInteractiveTemplateSelect,
  onInteractiveUpdate,
  editingInteractiveBlock
}, ref) => {
  // Interactive editing state
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [tabsData, setTabsData] = useState([
    { title: 'Tab 1', content: 'Content for tab 1', image: null, audio: null },
    { title: 'Tab 2', content: 'Content for tab 2', image: null, audio: null },
    { title: 'Tab 3', content: 'Content for tab 3', image: null, audio: null }
  ]);
  const [accordionData, setAccordionData] = useState([
    { title: 'Section 1', content: 'Content for section 1', image: null, audio: null },
    { title: 'Section 2', content: 'Content for section 2', image: null, audio: null },
    { title: 'Section 3', content: 'Content for section 3', image: null, audio: null }
  ]);
   
  // Helper function to extract accordion data from HTML
  const extractAccordionFromHTML = (htmlContent) => {
    const extractedData = [];
    
    try {
      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Find all accordion items
      const accordionItems = tempDiv.querySelectorAll('.accordion-item');
      
      accordionItems.forEach((item, index) => {
        // Extract title from accordion header
        const headerButton = item.querySelector('.accordion-header span');
        const title = headerButton ? headerButton.textContent.trim() : `Section ${index + 1}`;
        
        // Extract content from accordion content div
        const contentDiv = item.querySelector('.accordion-content .text-gray-700');
        const content = contentDiv ? contentDiv.textContent.trim() : '';
        
        // Extract image if present
        const imageElement = item.querySelector('.accordion-content img');
        const image = imageElement ? imageElement.src : null;
        
        // Extract audio if present (placeholder for future implementation)
        const audio = null;
        
        extractedData.push({
          title,
          content,
          image,
          audio
        });
      });
    } catch (error) {
      console.error('Error extracting accordion data from HTML:', error);
    }
    
    return extractedData;
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setTabsData,
    setAccordionData
  }));

  // Interactive templates
  const interactiveTemplates = [
    {
      id: 'tabs',
      title: 'Tabs',
      description: 'Interactive tabbed content',
      icon: <Layers className="h-6 w-6" />,
      preview: (
        <div className="w-full h-32 bg-white rounded-lg border p-3">
          <div className="flex border-b mb-2">
            <div className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-t border-b-2 border-blue-500">Tab 1</div>
            <div className="px-3 py-1 text-gray-500 text-xs">Tab 2</div>
            <div className="px-3 py-1 text-gray-500 text-xs">Tab 3</div>
          </div>
          <div className="text-xs text-gray-600">Content area for active tab</div>
        </div>
      )
    },
    {
      id: 'accordion',
      title: 'Accordion',
      description: 'Collapsible content sections',
      icon: <ChevronDown className="h-6 w-6" />,
      preview: (
        <div className="w-full h-32 bg-white rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between border-b pb-1">
            <span className="text-xs font-medium">Section 1</span>
            <ChevronDown className="h-3 w-3" />
          </div>
          <div className="text-xs text-gray-600 pl-2">Expanded content</div>
          <div className="flex items-center justify-between border-b pb-1">
            <span className="text-xs font-medium">Section 2</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      )
    }
  ];

  // Initialize form when editing
  useEffect(() => {
    if (editingInteractiveBlock && showInteractiveEditDialog) {
      console.log('Loading interactive block for editing:', editingInteractiveBlock);
      
      // First, try to determine template from multiple sources
      let template = editingInteractiveBlock.subtype || 
                    editingInteractiveBlock.template || 
                    editingInteractiveBlock.details?.template;
      
      // If no template found, try parsing content
      if (!template && editingInteractiveBlock.content) {
        try {
          const content = JSON.parse(editingInteractiveBlock.content);
          template = content.template;
        } catch (error) {
          console.log('Could not parse content as JSON, trying HTML detection');
        }
      }
      
      // If still no template, detect from HTML patterns
      if (!template && editingInteractiveBlock.html_css) {
        const htmlContent = editingInteractiveBlock.html_css;
        if (htmlContent.includes('data-template="accordion"') || 
            htmlContent.includes('accordion-header') || 
            htmlContent.includes('accordion-content')) {
          template = 'accordion';
        } else if (htmlContent.includes('data-template="tabs"') || 
                   htmlContent.includes('tab-button')) {
          template = 'tabs';
        }
      }
      
      console.log('Detected template:', template);
      
      if (template) {
        setSelectedTemplate(template);
        
        // Load existing data
        try {
          if (editingInteractiveBlock.content) {
            const content = JSON.parse(editingInteractiveBlock.content);
            if (template === 'tabs' && content.tabsData) {
              setTabsData(content.tabsData);
            } else if (template === 'accordion' && content.accordionData) {
              setAccordionData(content.accordionData);
            }
          } else {
            // If no structured content, try to extract from HTML
            if (template === 'accordion' && editingInteractiveBlock.html_css) {
              const extractedData = extractAccordionFromHTML(editingInteractiveBlock.html_css);
              if (extractedData.length > 0) {
                setAccordionData(extractedData);
              }
            }
          }
        } catch (error) {
          console.error('Error parsing interactive block content:', error);
          // Set default data if parsing fails
          if (template === 'accordion') {
            setAccordionData([
              { title: 'Section 1', content: 'Content for section 1', image: null, audio: null },
              { title: 'Section 2', content: 'Content for section 2', image: null, audio: null },
              { title: 'Section 3', content: 'Content for section 3', image: null, audio: null }
            ]);
          }
        }
      }
    }
  }, [editingInteractiveBlock, showInteractiveEditDialog]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    
    // Create fresh default content based on template type
    const defaultTabsData = [
      { title: 'Tab 1', content: 'Content for tab 1', image: null, audio: null },
      { title: 'Tab 2', content: 'Content for tab 2', image: null, audio: null },
      { title: 'Tab 3', content: 'Content for tab 3', image: null, audio: null }
    ];
    const defaultAccordionData = [
      { title: 'Section 1', content: 'Content for section 1', image: null, audio: null },
      { title: 'Section 2', content: 'Content for section 2', image: null, audio: null },
      { title: 'Section 3', content: 'Content for section 3', image: null, audio: null }
    ];
    
    const defaultData = template.id === 'tabs' ? defaultTabsData : defaultAccordionData;
    const interactiveContent = {
      template: template.id,
      [template.id === 'tabs' ? 'tabsData' : 'accordionData']: defaultData
    };

    const htmlContent = generateInteractiveHTML(template.id, defaultData);

    // Add the template directly to the lesson editor
    onInteractiveTemplateSelect({
      type: 'interactive',
      template: template.id,
      content: JSON.stringify(interactiveContent),
      html_css: htmlContent
    });

    setShowInteractiveTemplateSidebar(false);
    toast.success(`${template.title} template added to lesson!`);
  };

  const addTabsItem = () => {
    setTabsData([...tabsData, { title: `Tab ${tabsData.length + 1}`, content: `Content for tab ${tabsData.length + 1}`, image: null, audio: null }]);
  };

  const removeTabsItem = (index) => {
    if (tabsData.length > 1) {
      setTabsData(tabsData.filter((_, i) => i !== index));
    }
  };

  const updateTabsItem = (index, field, value) => {
    const updated = [...tabsData];
    updated[index][field] = value;
    setTabsData(updated);
  };

  const addAccordionItem = () => {
    setAccordionData([...accordionData, { title: `Section ${accordionData.length + 1}`, content: `Content for section ${accordionData.length + 1}`, image: null, audio: null }]);
  };

  const removeAccordionItem = (index) => {
    if (accordionData.length > 1) {
      setAccordionData(accordionData.filter((_, i) => i !== index));
    }
  };

  const updateAccordionItem = (index, field, value) => {
    const updated = [...accordionData];
    updated[index][field] = value;
    setAccordionData(updated);
  };

  // Image handling functions
  const handleImageUpload = async (index, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload only JPG, PNG, GIF, or WebP images');
        return;
      }
      
      try {
        // Upload image to cloud API
        const uploadResult = await uploadImage(file, {
          folder: 'lesson-images',
          public: true
        });
        
        if (uploadResult.success && uploadResult.imageUrl) {
          updateAccordionItem(index, 'image', {
            src: uploadResult.imageUrl, // Use cloud URL
            name: file.name,
            size: file.size,
            uploadedData: uploadResult
          });
          toast.success('Image uploaded successfully!');
        } else {
          throw new Error('Upload failed - no image URL returned');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(error.message || 'Failed to upload image. Please try again.');
        
        // Fallback to local URL for immediate preview
        const reader = new FileReader();
        reader.onload = (e) => {
          updateAccordionItem(index, 'image', {
            src: e.target.result,
            name: file.name,
            size: file.size,
            isLocal: true
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeAccordionImage = (index) => {
    updateAccordionItem(index, 'image', null);
    toast.success('Image removed successfully!');
  };

  // Audio handling functions
  const handleAudioUpload = async (index, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for audio
        toast.error('Audio file size should be less than 10MB');
        return;
      }
      
      // Check file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/m4a'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload only MP3, WAV, OGG, or M4A audio files');
        return;
      }
      
      try {
        // Upload audio to cloud API
        const uploadResult = await uploadAudioResource(file, {
          folder: 'lesson-audio',
          public: true,
          type: 'audio'
        });
        
        if (uploadResult.success && uploadResult.audioUrl) {
          updateAccordionItem(index, 'audio', {
            src: uploadResult.audioUrl, // Use cloud URL
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedData: uploadResult
          });
          toast.success('Audio uploaded successfully!');
        } else {
          throw new Error('Audio upload failed');
        }
      } catch (error) {
        console.error('Error uploading audio:', error);
        toast.error(error.message || 'Failed to upload audio. Please try again.');
        
        // Fallback to local URL for immediate preview
        const reader = new FileReader();
        reader.onload = (e) => {
          updateAccordionItem(index, 'audio', {
            src: e.target.result,
            name: file.name,
            size: file.size,
            type: file.type,
            isLocal: true
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeAccordionAudio = (index) => {
    updateAccordionItem(index, 'audio', null);
    toast.success('Audio removed successfully!');
  };

  // Image handling functions for tabs
  const handleTabImageUpload = async (index, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload only JPG, PNG, GIF, or WebP images');
        return;
      }
      
      try {
        // Upload image to cloud API
        const uploadResult = await uploadImage(file, {
          folder: 'lesson-images',
          public: true
        });
        
        if (uploadResult.success && uploadResult.imageUrl) {
          updateTabsItem(index, 'image', {
            src: uploadResult.imageUrl, // Use cloud URL
            name: file.name,
            size: file.size,
            uploadedData: uploadResult
          });
          toast.success('Image uploaded successfully!');
        } else {
          throw new Error('Upload failed - no image URL returned');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(error.message || 'Failed to upload image. Please try again.');
        
        // Fallback to local URL for immediate preview
        const reader = new FileReader();
        reader.onload = (e) => {
          updateTabsItem(index, 'image', {
            src: e.target.result,
            name: file.name,
            size: file.size,
            isLocal: true
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeTabImage = (index) => {
    updateTabsItem(index, 'image', null);
    toast.success('Image removed successfully!');
  };

  // Audio handling functions for tabs
  const handleTabAudioUpload = async (index, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for audio
        toast.error('Audio file size should be less than 10MB');
        return;
      }
      
      // Check file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/m4a'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload only MP3, WAV, OGG, or M4A audio files');
        return;
      }
      
      try {
        // Upload audio to cloud API
        const uploadResult = await uploadAudioResource(file, {
          folder: 'lesson-audio',
          public: true,
          type: 'audio'
        });
        
        if (uploadResult.success && uploadResult.audioUrl) {
          updateTabsItem(index, 'audio', {
            src: uploadResult.audioUrl, // Use cloud URL
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedData: uploadResult
          });
          toast.success('Audio uploaded successfully!');
        } else {
          throw new Error('Audio upload failed');
        }
      } catch (error) {
        console.error('Error uploading audio:', error);
        toast.error(error.message || 'Failed to upload audio. Please try again.');
        
        // Fallback to local URL for immediate preview
        const reader = new FileReader();
        reader.onload = (e) => {
          updateTabsItem(index, 'audio', {
            src: e.target.result,
            name: file.name,
            size: file.size,
            type: file.type,
            isLocal: true
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeTabAudio = (index) => {
    updateTabsItem(index, 'audio', null);
    toast.success('Audio removed successfully!');
  };

  const generateInteractiveHTML = (template, data) => {
    if (template === 'tabs') {
      const tabsId = `tabs-${Date.now()}`;
      const tabsHTML = `
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gradient-to-r from-blue-500 to-purple-600">
          <div class="interactive-tabs" data-template="tabs" id="${tabsId}">
            <div class="flex border-b border-gray-200 mb-4" role="tablist">
              ${data.map((tab, index) => `
                <button class="tab-button px-4 py-2 text-sm font-medium transition-colors duration-200 ${index === 0 ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}" 
                        role="tab" 
                        data-tab="${index}"
                        data-container="${tabsId}"
                        onclick="window.switchTab && window.switchTab('${tabsId}', ${index})">
                  ${tab.title}
                </button>
              `).join('')}
            </div>
            <div class="tab-content">
              ${data.map((tab, index) => `
                <div class="tab-panel ${index === 0 ? 'block' : 'hidden'}" data-panel="${index}" role="tabpanel">
                  <div class="text-gray-700 leading-relaxed ${tab.image || tab.audio ? 'mb-4' : ''}">${tab.content}</div>
                  ${tab.image ? `
                    <div class="relative ${tab.audio ? '' : 'mb-4'}">
                      <img src="${tab.image.src}" alt="${tab.image.name || 'Tab image'}" class="w-full h-auto rounded-lg shadow-sm" style="height: 250px; object-fit: cover;" />
                      ${tab.audio ? `
                        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 rounded-b-lg p-3">
                          <audio controls class="w-full" preload="metadata" style="height: 32px;">
                            <source src="${tab.audio.src}" type="${tab.audio.type}">
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      ` : ''}
                    </div>
                  ` : ''}
                  ${tab.audio && !tab.image ? `
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.846 13.5H2a1 1 0 01-1-1v-3a1 1 0 011-1h2.846l3.537-3.314a1 1 0 011.617.814zM12 8a1 1 0 011.414 0L15 9.586l1.586-1.586A1 1 0 1118 9.414L16.414 11 18 12.586A1 1 0 0116.586 14L15 12.414 13.414 14A1 1 0 0112 12.586L13.586 11 12 9.414A1 1 0 0112 8z" clip-rule="evenodd"></path>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-800">${tab.audio.name}</p>
                          <p class="text-xs text-gray-500">${Math.round(tab.audio.size / 1024)} KB</p>
                        </div>
                      </div>
                      <audio controls class="w-full" preload="metadata">
                        <source src="${tab.audio.src}" type="${tab.audio.type}">
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      return tabsHTML;
    } else if (template === 'accordion') {
      const accordionId = `accordion-${Date.now()}`;
      const accordionHTML = `
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gradient-to-r from-green-500 to-teal-600">
          <div class="interactive-accordion" data-template="accordion" id="${accordionId}">
            ${data.map((item, index) => `
              <div class="accordion-item border-b border-gray-200 last:border-b-0">
                <button class="accordion-header w-full flex items-center justify-between py-4 text-left text-gray-800 hover:text-gray-600 transition-colors duration-200"
                        data-container="${accordionId}"
                        onclick="window.toggleAccordion && window.toggleAccordion('${accordionId}', ${index})">
                  <span class="font-medium">${item.title}</span>
                  <svg class="accordion-icon w-5 h-5 transform transition-transform duration-200 ${index === 0 ? 'rotate-180' : ''}" 
                       data-icon="${index}" 
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div class="accordion-content overflow-hidden transition-all duration-300 ${index === 0 ? 'max-h-96 pb-4' : 'max-h-0'}" 
                     data-content="${index}">
                  <div class="pl-4">
                    <div class="text-gray-700 leading-relaxed ${item.image || item.audio ? 'mb-4' : ''}">${item.content}</div>
                    ${item.image ? `
                      <div class="relative ${item.audio ? '' : 'mb-4'}">
                        <img src="${item.image.src}" alt="${item.image.name || 'Accordion image'}" class="w-full h-auto rounded-lg shadow-sm" style="height: 250px; object-fit: cover;" />
                        ${item.audio ? `
                          <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 rounded-b-lg p-3">
                            <audio controls class="w-full" preload="metadata" style="height: 32px;">
                              <source src="${item.audio.src}" type="${item.audio.type}">
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ` : ''}
                      </div>
                    ` : ''}
                    ${item.audio && !item.image ? `
                      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div class="flex items-center gap-3 mb-2">
                          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.846 13.5H2a1 1 0 01-1-1v-3a1 1 0 011-1h2.846l3.537-3.314a1 1 0 011.617.814zM12 8a1 1 0 011.414 0L15 9.586l1.586-1.586A1 1 0 1118 9.414L16.414 11 18 12.586A1 1 0 0116.586 14L15 12.414 13.414 14A1 1 0 0112 12.586L13.586 11 12 9.414A1 1 0 0112 8z" clip-rule="evenodd"></path>
                            </svg>
                          </div>
                          <div class="flex-1">
                            <p class="text-sm font-medium text-gray-800">${item.audio.name}</p>
                            <p class="text-xs text-gray-500">${Math.round(item.audio.size / 1024)} KB</p>
                          </div>
                        </div>
                        <audio controls class="w-full" preload="metadata">
                          <source src="${item.audio.src}" type="${item.audio.type}">
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      return accordionHTML;
    }
    return '';
  };

  const handleSave = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    const data = selectedTemplate === 'tabs' ? tabsData : accordionData;
    
    // Validate that all items have content
    const hasEmptyItems = data.some(item => !item.title.trim() || !item.content.trim());
    if (hasEmptyItems) {
      toast.error('Please fill in all titles and content');
      return;
    }

    const interactiveContent = {
      template: selectedTemplate,
      [selectedTemplate === 'tabs' ? 'tabsData' : 'accordionData']: data
    };

    const htmlContent = generateInteractiveHTML(selectedTemplate, data);

    if (editingInteractiveBlock) {
      onInteractiveUpdate(editingInteractiveBlock.id, {
        content: JSON.stringify(interactiveContent),
        html_css: htmlContent,
        subtype: selectedTemplate // Add subtype for proper identification
      });
    } else {
      onInteractiveTemplateSelect({
        type: 'interactive',
        subtype: selectedTemplate, // Add subtype for proper identification
        template: selectedTemplate,
        content: JSON.stringify(interactiveContent),
        html_css: htmlContent
      });
    }

    setShowInteractiveEditDialog(false);
    toast.success('Interactive content saved successfully!');
  };

  const handleCancel = () => {
    setShowInteractiveEditDialog(false);
    setSelectedTemplate('');
    setTabsData([
      { title: 'Tab 1', content: 'Content for tab 1', image: null, audio: null },
      { title: 'Tab 2', content: 'Content for tab 2', image: null, audio: null },
      { title: 'Tab 3', content: 'Content for tab 3', image: null, audio: null }
    ]);
    setAccordionData([
      { title: 'Section 1', content: 'Content for section 1', image: null, audio: null },
      { title: 'Section 2', content: 'Content for section 2', image: null, audio: null },
      { title: 'Section 3', content: 'Content for section 3', image: null, audio: null }
    ]);
  };

  return (
    <>
      {/* Template Selection Sidebar */}
      {showInteractiveTemplateSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-white w-96 h-full shadow-xl animate-slide-in-left overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Interactive Templates</h2>
                <button
                  onClick={() => setShowInteractiveTemplateSidebar(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Choose an interactive template to add to your lesson</p>
            </div>

            <div className="p-6 space-y-4">
              {interactiveTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{template.title}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                  {template.preview}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowInteractiveTemplateSidebar(false)} />
        </div>
      )}

      {/* Interactive Edit Dialog */}
      <Dialog open={showInteractiveEditDialog} onOpenChange={setShowInteractiveEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInteractiveBlock ? 'Edit' : 'Create'} Interactive Content
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {selectedTemplate === 'tabs' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Tabs Configuration</h3>
                  <Button onClick={addTabsItem} size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Tab
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {tabsData.map((tab, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-700">Tab {index + 1}</span>
                        {tabsData.length > 1 && (
                          <Button
                            onClick={() => removeTabsItem(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tab Title
                          </label>
                          <input
                            type="text"
                            value={tab.title}
                            onChange={(e) => updateTabsItem(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter tab title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tab Content
                          </label>
                          <textarea
                            value={tab.content}
                            onChange={(e) => updateTabsItem(index, 'content', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter tab content"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tab Image (Optional)
                          </label>
                          {tab.image ? (
                            <div className="space-y-3">
                              <div className="relative inline-block">
                                <img
                                  src={tab.image.src}
                                  alt={tab.image.name}
                                  className="max-w-full h-32 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeTabImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-500">
                                {tab.image.name} ({Math.round(tab.image.size / 1024)} KB)
                              </p>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleTabImageUpload(index, e)}
                                className="hidden"
                                id={`tab-image-upload-${index}`}
                              />
                              <label
                                htmlFor={`tab-image-upload-${index}`}
                                className="cursor-pointer flex flex-col items-center space-y-2"
                              >
                                <Upload className="h-8 w-8 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Click to upload image
                                </span>
                                <span className="text-xs text-gray-500">
                                  PNG, JPG, GIF up to 5MB
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tab Audio (Optional)
                          </label>
                          {tab.audio ? (
                            <div className="space-y-3">
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <Volume2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-800">{tab.audio.name}</p>
                                      <p className="text-xs text-gray-500">{Math.round(tab.audio.size / 1024)} KB</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeTabAudio(index)}
                                    className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                <audio controls className="w-full" preload="metadata">
                                  <source src={tab.audio.src} type={tab.audio.type} />
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleTabAudioUpload(index, e)}
                                className="hidden"
                                id={`tab-audio-upload-${index}`}
                              />
                              <label
                                htmlFor={`tab-audio-upload-${index}`}
                                className="cursor-pointer flex flex-col items-center space-y-2"
                              >
                                <Volume2 className="h-8 w-8 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Click to upload audio
                                </span>
                                <span className="text-xs text-gray-500">
                                  MP3, WAV, OGG up to 10MB
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTemplate === 'accordion' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Accordion Configuration</h3>
                  <Button onClick={addAccordionItem} size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Section
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {accordionData.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-700">Section {index + 1}</span>
                        {accordionData.length > 1 && (
                          <Button
                            onClick={() => removeAccordionItem(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateAccordionItem(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter section title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Content
                          </label>
                          <textarea
                            value={item.content}
                            onChange={(e) => updateAccordionItem(index, 'content', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter section content"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Image (Optional)
                          </label>
                          {item.image ? (
                            <div className="space-y-3">
                              <div className="relative inline-block">
                                <img
                                  src={item.image.src}
                                  alt={item.image.name}
                                  className="max-w-full h-32 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeAccordionImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-500">
                                {item.image.name} ({Math.round(item.image.size / 1024)} KB)
                              </p>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(index, e)}
                                className="hidden"
                                id={`image-upload-${index}`}
                              />
                              <label
                                htmlFor={`image-upload-${index}`}
                                className="cursor-pointer flex flex-col items-center space-y-2"
                              >
                                <Upload className="h-8 w-8 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Click to upload image
                                </span>
                                <span className="text-xs text-gray-500">
                                  PNG, JPG, GIF up to 5MB
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Audio (Optional)
                          </label>
                          {item.audio ? (
                            <div className="space-y-3">
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <Volume2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-800">{item.audio.name}</p>
                                      <p className="text-xs text-gray-500">{Math.round(item.audio.size / 1024)} KB</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeAccordionAudio(index)}
                                    className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                <audio controls className="w-full" preload="metadata">
                                  <source src={item.audio.src} type={item.audio.type} />
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleAudioUpload(index, e)}
                                className="hidden"
                                id={`audio-upload-${index}`}
                              />
                              <label
                                htmlFor={`audio-upload-${index}`}
                                className="cursor-pointer flex flex-col items-center space-y-2"
                              >
                                <Volume2 className="h-8 w-8 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Click to upload audio
                                </span>
                                <span className="text-xs text-gray-500">
                                  MP3, WAV, OGG up to 10MB
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingInteractiveBlock ? 'Update' : 'Create'} Interactive Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

InteractiveComponent.displayName = 'InteractiveComponent';

export default InteractiveComponent;
