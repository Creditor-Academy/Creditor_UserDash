import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { List, ListOrdered, CheckSquare, X, Plus, Trash2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const ListComponent = forwardRef(({
  showListTemplateSidebar,
  setShowListTemplateSidebar,
  showListEditDialog,
  setShowListEditDialog,
  onListTemplateSelect,
  onListUpdate,
  editingListBlock
}, ref) => {
  // List editing state
  const [listItems, setListItems] = useState(['']);
  const [listType, setListType] = useState('bulleted');
  const [checkedItems, setCheckedItems] = useState({});

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setListItems,
    setListType,
    setCheckedItems
  }));

  // List templates with beautiful previews
  const listTemplates = [
    {
      id: 'numbered_list',
      title: 'Numbered List',
      description: 'Ordered list with numbers for sequential content',
      icon: <ListOrdered className="h-5 w-5" />,
      type: 'numbered',
      preview: (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                1
              </div>
              <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                First item - Add your content here. You can include text, images, or key opportunities working for you.
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                2
              </div>
              <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                List of essentials. You can also add or delete items as needed.
              </div>
            </div>
          </div>
        </div>
      ),
      defaultContent: {
        items: [
          'First item - Add your content here. You can include text, images, or key opportunities working for you.',
          'List of essentials. You can also add or delete items as needed. Next, let\'s focus on how you can build better habits.',
          'Without distractions. The most rewarding adventures often start and end with meaningful connections and shared experiences.'
        ],
        listType: 'numbered'
      }
    },
    {
      id: 'checkbox_list',
      title: 'Checkbox List',
      description: 'Interactive checklist for tasks and to-do items',
      icon: <CheckSquare className="h-5 w-5" />,
      type: 'checkbox',
      preview: (
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <div className="w-5 h-5 border-2 border-pink-400 rounded bg-white flex items-center justify-center">
                  <div className="w-3 h-3 bg-pink-500 rounded-sm"></div>
                </div>
              </div>
              <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                First item - Add your content here. You can include text, images, or key opportunities working for you.
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <div className="w-5 h-5 border-2 border-pink-400 rounded bg-white"></div>
              </div>
              <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                List of essentials. You can also add or delete items as needed.
              </div>
            </div>
          </div>
        </div>
      ),
      defaultContent: {
        items: [
          'First item - Add your content here. You can include text, images, or key opportunities working for you.',
          'List of essentials. You can also add or delete items as needed. Next, let\'s focus on how you can build better habits.',
          'Without distractions. The most rewarding adventures often start and end with meaningful connections and shared experiences.'
        ],
        listType: 'checkbox',
        checkedItems: {}
      }
    },
    {
      id: 'bulleted_list',
      title: 'Bulleted List',
      description: 'Simple bullet points for general content organization',
      icon: <List className="h-5 w-5" />,
      type: 'bulleted',
      preview: (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="mt-2">
                <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
              </div>
              <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                First item - Add your content here. You can include text, images, or key opportunities working for you.
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="mt-2">
                <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
              </div>
              <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                List of essentials. You can also add or delete items as needed.
              </div>
            </div>
          </div>
        </div>
      ),
      defaultContent: {
        items: [
          'First item - Add your content here. You can include text, images, or key opportunities working for you.',
          'List of essentials. You can also add or delete items as needed. Next, let\'s focus on how you can build better habits.',
          'Without distractions. The most rewarding adventures often start and end with meaningful connections and shared experiences.'
        ],
        listType: 'bulleted'
      }
    }
  ];

  // Initialize list editing state when dialog opens
  React.useEffect(() => {
    if (showListEditDialog && editingListBlock) {
      try {
        const listContent = JSON.parse(editingListBlock.content || '{}');
        setListItems(listContent.items || ['']);
        setListType(listContent.listType || 'bulleted');
        setCheckedItems(listContent.checkedItems || {});
      } catch (e) {
        console.error('Error parsing list content:', e);
        setListItems(['']);
        setListType('bulleted');
        setCheckedItems({});
      }
    }
  }, [showListEditDialog, editingListBlock]);

  const handleListTemplateSelect = (template) => {
    let htmlContent = '';
    const content = template.defaultContent;

    switch (template.type) {
      case 'numbered':
        htmlContent = `
          <div class="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
            <ol class="space-y-4 list-none">
              ${content.items.map((item, index) => `
                <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-orange-300/50 hover:shadow-md transition-all duration-200">
                  <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    ${index + 1}
                  </div>
                  <div class="flex-1 text-gray-800 leading-relaxed">
                    ${item}
                  </div>
                </li>
              `).join('')}
            </ol>
          </div>
        `;
        break;

      case 'checkbox':
        htmlContent = `
          <div class="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
            <div class="space-y-4">
              ${content.items.map((item, index) => `
                <div class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-pink-300/50 hover:shadow-md transition-all duration-200">
                  <div class="flex-shrink-0 mt-1">
                    <div class="w-5 h-5 border-2 border-pink-400 rounded bg-white flex items-center justify-center cursor-pointer hover:border-pink-500 transition-colors">
                      <input type="checkbox" class="hidden checkbox-item" data-index="${index}" />
                      <div class="checkbox-visual w-3 h-3 bg-pink-500 rounded-sm opacity-0 transition-opacity"></div>
                    </div>
                  </div>
                  <div class="flex-1 text-gray-800 leading-relaxed">
                    ${item}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;

      case 'bulleted':
        htmlContent = `
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <ul class="space-y-4 list-none">
              ${content.items.map((item) => `
                <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-blue-300/50 hover:shadow-md transition-all duration-200">
                  <div class="flex-shrink-0 mt-2">
                    <div class="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                  </div>
                  <div class="flex-1 text-gray-800 leading-relaxed">
                    ${item}
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        `;
        break;

      default:
        htmlContent = `
          <ul class="space-y-3 list-disc list-inside">
            ${content.items.map((item) => `
              <li class="text-gray-800 leading-relaxed">${item}</li>
            `).join('')}
          </ul>
        `;
    }

    const newBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: 'list',
      title: template.title,
      listType: template.type,
      content: JSON.stringify(content),
      html_css: htmlContent,
      order: 1,
      details: {
        list_type: template.type,
        listType: template.type
      }
    };

    onListTemplateSelect(newBlock);
    setShowListTemplateSidebar(false);
  };

  const handleListUpdate = () => {
    if (!editingListBlock) return;
    
    const updatedContent = {
      items: listItems,
      listType: listType,
      checkedItems: listType === 'checkbox' ? checkedItems : {}
    };
    
    onListUpdate(editingListBlock.id, JSON.stringify(updatedContent));
    setShowListEditDialog(false);
  };

  const addListItem = () => {
    setListItems([...listItems, '']);
  };

  const removeListItem = (index) => {
    if (listItems.length > 1) {
      const newItems = listItems.filter((_, i) => i !== index);
      setListItems(newItems);
      
      // Update checked items if removing from checkbox list
      if (listType === 'checkbox') {
        const newCheckedItems = { ...checkedItems };
        delete newCheckedItems[index];
        // Reindex remaining items
        const reindexedCheckedItems = {};
        Object.keys(newCheckedItems).forEach(key => {
          const oldIndex = parseInt(key);
          if (oldIndex > index) {
            reindexedCheckedItems[oldIndex - 1] = newCheckedItems[key];
          } else if (oldIndex < index) {
            reindexedCheckedItems[oldIndex] = newCheckedItems[key];
          }
        });
        setCheckedItems(reindexedCheckedItems);
      }
    }
  };

  const updateListItem = (index, value) => {
    const newItems = [...listItems];
    newItems[index] = value;
    setListItems(newItems);
  };

  const toggleCheckboxItem = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <>
      {/* List Template Sidebar */}
      {showListTemplateSidebar && (
        <div className="fixed inset-0 z-[9999] flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-out"
            onClick={() => setShowListTemplateSidebar(false)}
          />
          {/* Sidebar */}
          <div className="relative w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-out animate-slide-in-left">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">List Types</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Choose a list type to add to your lesson
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowListTemplateSidebar(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto">
              {listTemplates.map((template) => (
                <div 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 rounded-xl border border-gray-200 hover:border-gray-300 overflow-hidden group"
                  onClick={() => handleListTemplateSelect(template)}
                >
                  {/* Template Header with Type Name */}
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow duration-200">
                          {template.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{template.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200 group-hover:border-blue-300 group-hover:text-blue-700 transition-all duration-200">
                        {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Template Preview */}
                  <div className="p-0">
                    {template.preview}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List Edit Dialog */}
      <Dialog open={showListEditDialog} onOpenChange={setShowListEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {editingListBlock?.textType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current List Type Display (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">List Type</label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {listType === 'numbered' && (
                  <>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ListOrdered className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Numbered List</span>
                      <p className="text-sm text-gray-600">Ordered list with numbers for sequential content</p>
                    </div>
                  </>
                )}
                {listType === 'checkbox' && (
                  <>
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <CheckSquare className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Checkbox List</span>
                      <p className="text-sm text-gray-600">Interactive checklist for tasks and to-do items</p>
                    </div>
                  </>
                )}
                {listType === 'bulleted' && (
                  <>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <List className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Bulleted List</span>
                      <p className="text-sm text-gray-600">Simple bullet points for general content organization</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* List Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">List Items</label>
                <Button
                  onClick={addListItem}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {listItems.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    {listType === 'checkbox' && (
                      <div className="mt-3">
                        <input
                          type="checkbox"
                          checked={checkedItems[index] || false}
                          onChange={() => toggleCheckboxItem(index)}
                          className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <textarea
                        value={item}
                        onChange={(e) => updateListItem(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="3"
                        placeholder={`List item ${index + 1}`}
                      />
                    </div>
                    {listItems.length > 1 && (
                      <Button
                        onClick={() => removeListItem(index)}
                        size="sm"
                        variant="outline"
                        className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowListEditDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleListUpdate}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

ListComponent.displayName = 'ListComponent';

export default ListComponent;
