import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Layers, X, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

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
    { title: 'Tab 1', content: 'Content for tab 1' },
    { title: 'Tab 2', content: 'Content for tab 2' },
    { title: 'Tab 3', content: 'Content for tab 3' }
  ]);
  const [accordionData, setAccordionData] = useState([
    { title: 'Section 1', content: 'Content for section 1' },
    { title: 'Section 2', content: 'Content for section 2' },
    { title: 'Section 3', content: 'Content for section 3' }
  ]);

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
      try {
        const content = JSON.parse(editingInteractiveBlock.content);
        setSelectedTemplate(content.template);
        if (content.template === 'tabs' && content.tabsData) {
          setTabsData(content.tabsData);
        } else if (content.template === 'accordion' && content.accordionData) {
          setAccordionData(content.accordionData);
        }
      } catch (error) {
        console.error('Error parsing interactive block content:', error);
      }
    }
  }, [editingInteractiveBlock, showInteractiveEditDialog]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    
    // Create default content based on template type
    const defaultData = template.id === 'tabs' ? tabsData : accordionData;
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
    setTabsData([...tabsData, { title: `Tab ${tabsData.length + 1}`, content: `Content for tab ${tabsData.length + 1}` }]);
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
    setAccordionData([...accordionData, { title: `Section ${accordionData.length + 1}`, content: `Content for section ${accordionData.length + 1}` }]);
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
                  <div class="text-gray-700 leading-relaxed">${tab.content}</div>
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
                  <div class="text-gray-700 leading-relaxed pl-4">${item.content}</div>
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
        html_css: htmlContent
      });
    } else {
      onInteractiveTemplateSelect({
        type: 'interactive',
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
      { title: 'Tab 1', content: 'Content for tab 1' },
      { title: 'Tab 2', content: 'Content for tab 2' },
      { title: 'Tab 3', content: 'Content for tab 3' }
    ]);
    setAccordionData([
      { title: 'Section 1', content: 'Content for section 1' },
      { title: 'Section 2', content: 'Content for section 2' },
      { title: 'Section 3', content: 'Content for section 3' }
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
