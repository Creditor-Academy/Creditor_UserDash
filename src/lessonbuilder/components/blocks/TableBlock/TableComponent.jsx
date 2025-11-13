import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  X,
  Plus,
  Save,
  Table,
  Grid,
  Columns,
  Minus,
  MoreHorizontal,
} from 'lucide-react';

const TableComponent = ({
  onTemplateSelect,
  onClose,
  onTableUpdate,
  editingBlock = null,
  isEditing = false,
  onAICreation,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(isEditing || false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const componentRef = useRef();

  // Animation effect for smooth appearance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Initialize edit mode and table data when editing an existing block
  useEffect(() => {
    setIsLoading(true);

    if (editingBlock && isEditing) {
      setIsEditMode(true);

      // Initialize with default data first
      const defaultData = {
        headers: ['Column 1', 'Column 2'],
        data: [['', '']],
      };

      // Parse existing table data from the block
      try {
        if (editingBlock.content) {
          const parsedData = JSON.parse(editingBlock.content);
          if (parsedData && parsedData.headers && parsedData.data) {
            setTableData(parsedData);
            setSelectedTemplate(parsedData.templateId || 'two_columns');
          } else {
            setTableData(defaultData);
            setSelectedTemplate('two_columns');
          }
        } else {
          setTableData(defaultData);
          setSelectedTemplate('two_columns');
        }
      } catch (e) {
        console.error('Error parsing table data:', e);
        setTableData(defaultData);
        setSelectedTemplate('two_columns');
      }
    } else {
      setIsEditMode(false);
    }

    // Small delay to prevent flicker
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [editingBlock, isEditing]);

  // Table templates with different formats
  const tableTemplates = [
    {
      id: 'two_columns',
      title: 'Two Columns',
      description: 'Responsive two-column layout for side-by-side content',
      icon: <Columns className="h-6 w-6" />,
      type: 'layout',
      defaultData: {
        columns: 2,
        rows: 1,
        headers: ['Left Column', 'Right Column'],
        data: [
          [
            'Add your content here. You can include text, lists, or images.',
            'Add your content here. You can include text, lists, or images.',
          ],
        ],
      },
    },
    {
      id: 'three_columns',
      title: 'Three Columns',
      description: 'Balanced three-column layout for features or highlights',
      icon: <Grid className="h-6 w-6" />,
      type: 'layout',
      defaultData: {
        columns: 3,
        rows: 1,
        headers: ['Column 1', 'Column 2', 'Column 3'],
        data: [
          [
            'Feature or content description',
            'Feature or content description',
            'Feature or content description',
          ],
        ],
      },
    },
    {
      id: 'responsive_table',
      title: 'Responsive Table',
      description: 'Fully responsive table with add/remove functionality',
      icon: <MoreHorizontal className="h-6 w-6" />,
      type: 'responsive',
      defaultData: {
        columns: 4,
        rows: 2,
        headers: ['Name', 'Position', 'Department', 'Email'],
        data: [
          ['John Doe', 'Manager', 'Sales', 'john@example.com'],
          ['Jane Smith', 'Developer', 'IT', 'jane@example.com'],
        ],
      },
    },
  ];

  // Initialize table data if editing existing block
  useEffect(() => {
    if (isEditing && editingBlock) {
      try {
        const parsedData = JSON.parse(editingBlock.content || '{}');
        setTableData(parsedData);
        setSelectedTemplate(parsedData.templateId);
        setIsEditMode(true);
      } catch (e) {
        console.error('Error parsing table data:', e);
      }
    }
  }, [isEditing, editingBlock]);

  const handleTemplateSelect = template => {
    const htmlContent = generateTableHTML(
      template.defaultData,
      template.id,
      false
    );

    const tableBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: 'table',
      title: template.title,
      textType: 'table',
      templateId: template.id,
      tableType: template.id,
      content: JSON.stringify({
        ...template.defaultData,
        templateId: template.id,
        tableType: template.id,
      }),
      html_css: htmlContent,
      order: Date.now(),
    };

    // Add the table block to the content area
    if (onTemplateSelect) {
      onTemplateSelect(tableBlock);
    }

    // Close the component without opening edit mode
    onClose();
  };

  const addRow = () => {
    if (!tableData) return;
    setTableData(prev => ({
      ...prev,
      data: [...prev.data, new Array(prev.headers.length).fill('')],
    }));
  };

  const removeRow = rowIndex => {
    if (!tableData || tableData.data.length <= 1) return;
    setTableData(prev => ({
      ...prev,
      data: prev.data.filter((_, index) => index !== rowIndex),
    }));
  };

  const addColumn = () => {
    if (!tableData) return;
    setTableData(prev => ({
      ...prev,
      headers: [...prev.headers, `Header ${prev.headers.length + 1}`],
      data: prev.data.map(row => [...row, '']),
    }));
  };

  const removeColumn = colIndex => {
    if (!tableData || tableData.headers.length <= 1) return;
    setTableData(prev => ({
      ...prev,
      headers: prev.headers.filter((_, index) => index !== colIndex),
      data: prev.data.map(row => row.filter((_, index) => index !== colIndex)),
    }));
  };

  const updateCell = (rowIndex, colIndex, value) => {
    if (!tableData) return;
    setTableData(prev => ({
      ...prev,
      data: prev.data.map((row, rIndex) =>
        rIndex === rowIndex
          ? row.map((cell, cIndex) => (cIndex === colIndex ? value : cell))
          : row
      ),
    }));
  };

  const updateHeader = (colIndex, value) => {
    if (!tableData) return;
    setTableData(prev => ({
      ...prev,
      headers: prev.headers.map((header, index) =>
        index === colIndex ? value : header
      ),
    }));
  };

  const generateTableHTML = (data, templateId, isPreview = false) => {
    const template = tableTemplates.find(t => t.id === templateId);

    if (template?.type === 'layout') {
      // Generate pure column layout HTML without containers
      const colClass = isPreview
        ? 'grid-cols-1'
        : data.columns === 2
          ? 'md:grid-cols-2'
          : data.columns === 3
            ? 'md:grid-cols-3'
            : `md:grid-cols-${data.columns}`;

      const gridGap = isPreview ? 'gap-1' : 'gap-8';
      const padding = isPreview ? 'p-1' : 'p-6';
      const textSize = isPreview ? 'text-xs' : 'text-base';
      const headerSize = isPreview ? 'text-xs' : 'text-lg';

      return `
        <div class="grid ${colClass} ${gridGap}">
          ${data.data[0]
            .map(
              (content, index) => `
            <div class="group relative ${padding} rounded-lg border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 min-h-fit">
              <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg"></div>
              <div class="flex items-start mb-2">
                <div class="w-1 h-1 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                <h3 class="font-bold ${headerSize} text-gray-900 break-words leading-tight">${data.headers[index]}</h3>
              </div>
              <div class="text-gray-700 leading-relaxed ${textSize} break-words whitespace-pre-wrap overflow-wrap-anywhere">${content}</div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else {
      // Generate pure table HTML without wrapper containers
      const padding = isPreview ? 'px-1 py-0.5' : 'px-6 py-4';
      const textSize = isPreview ? 'text-xs' : 'text-sm';
      const headerTextSize = isPreview ? 'text-xs' : 'text-sm';
      const tableClass = isPreview ? 'w-full text-xs' : 'min-w-full';

      return `
        <div class="relative">
          <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-sm table-scrollbar">
            <table class="${tableClass} divide-y divide-gray-200 min-w-full">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                ${data.headers
                  .map(
                    (header, index) => `
                  <th class="${padding} text-left ${headerTextSize} font-bold text-gray-700 uppercase tracking-tight border-r border-gray-200 last:border-r-0 align-top" style="min-width: 150px; max-width: 300px;">
                    <div class="flex items-start">
                      <div class="w-1 h-1 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                      <span class="break-words leading-tight">${header}</span>
                    </div>
                  </th>
                `
                  )
                  .join('')}
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              ${data.data
                .map(
                  (row, rowIndex) => `
                <tr class="hover:bg-gray-50 transition-colors duration-200 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}">
                  ${row
                    .map(
                      (cell, cellIndex) => `
                    <td class="${padding} text-gray-800 border-r border-gray-100 last:border-r-0 align-top" style="min-width: 150px; max-width: 300px;">
                      <div class="font-medium ${textSize} break-words whitespace-pre-wrap leading-relaxed">${cell}</div>
                    </td>
                  `
                    )
                    .join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
            </table>
          </div>
        </div>
      `;
    }
  };

  const handleSave = () => {
    if (!tableData || !selectedTemplate) return;

    const template = tableTemplates.find(t => t.id === selectedTemplate);
    const htmlContent = generateTableHTML(tableData, selectedTemplate, false);

    const tableBlock = {
      id: editingBlock?.id || `block_${Date.now()}`,
      block_id: editingBlock?.block_id || `block_${Date.now()}`,
      type: 'table',
      title: template.title,
      textType: 'table',
      templateId: selectedTemplate,
      tableType: selectedTemplate,
      content: JSON.stringify({
        ...tableData,
        templateId: selectedTemplate,
        tableType: selectedTemplate,
      }),
      html_css: htmlContent,
      order: editingBlock?.order || Date.now(),
    };

    if (isEditing && onTableUpdate) {
      onTableUpdate(
        tableBlock.id,
        JSON.stringify({
          ...tableData,
          templateId: selectedTemplate,
          tableType: selectedTemplate,
        }),
        htmlContent,
        selectedTemplate
      );
    } else if (onTemplateSelect) {
      onTemplateSelect(tableBlock);
    }

    onClose();
  };

  const renderTableEditor = () => {
    if (!tableData || !selectedTemplate) {
      return (
        <div className="p-4 text-center text-gray-500">
          Loading table data...
        </div>
      );
    }

    const template = tableTemplates.find(t => t.id === selectedTemplate);
    if (!template) {
      return (
        <div className="p-4 text-center text-red-500">Template not found</div>
      );
    }

    // Render different editors based on table type
    if (template?.type === 'layout') {
      return renderColumnEditor(template);
    } else {
      return renderDataTableEditor(template);
    }
  };

  const renderColumnEditor = (template, skipHeader = false) => {
    return (
      <div className="space-y-6">
        {/* Header with template info - only show if not skipped */}
        {!skipHeader && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                {template.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Edit {template.title}
                </h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Column Editor */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900">
            Edit Column Content
          </h4>

          <div className="space-y-4">
            {tableData && tableData.headers ? (
              tableData.headers.map((header, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Column {index + 1} Header
                    </label>
                    <input
                      type="text"
                      value={header || ''}
                      onChange={e => updateHeader(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Column ${index + 1} Header`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Column {index + 1} Content
                    </label>
                    <textarea
                      value={
                        tableData.data &&
                        tableData.data[0] &&
                        tableData.data[0][index]
                          ? tableData.data[0][index]
                          : ''
                      }
                      onChange={e => updateCell(0, index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="4"
                      placeholder={`Add your content here. You can include text, lists, or images.`}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                No table data available
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline" className="px-4 py-2">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const renderDataTableEditor = (template, skipHeader = false) => {
    return (
      <div className="space-y-6">
        {/* Header with template info - only show if not skipped */}
        {!skipHeader && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                {template.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Edit {template.title}
                </h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-gray-900">
              Edit Table Content
            </h4>
            <div className="flex space-x-2">
              <Button
                onClick={addRow}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Row
              </Button>
              <Button
                onClick={addColumn}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Column
              </Button>
            </div>
          </div>

          {/* Headers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Column Headers
            </label>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${tableData && tableData.headers ? tableData.headers.length : 1}, 1fr)`,
              }}
            >
              {tableData && tableData.headers ? (
                tableData.headers.map((header, index) => (
                  <div key={index} className="relative">
                    <input
                      type="text"
                      value={header || ''}
                      onChange={e => updateHeader(index, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                      placeholder={`Header ${index + 1}`}
                    />
                    {/* Remove Column Button on Headers */}
                    {tableData.headers.length > 1 && (
                      <Button
                        onClick={() => removeColumn(index)}
                        size="sm"
                        variant="outline"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No headers available
                </div>
              )}
            </div>
          </div>

          {/* Data Rows */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Table Data
            </label>
            <div className="space-y-2">
              {tableData && tableData.data ? (
                tableData.data.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-2">
                    <div
                      className="grid gap-2 flex-1"
                      style={{
                        gridTemplateColumns: `repeat(${row ? row.length : 1}, 1fr)`,
                      }}
                    >
                      {row ? (
                        row.map((cell, cellIndex) => (
                          <div key={cellIndex} className="relative">
                            <textarea
                              value={cell || ''}
                              onChange={e =>
                                updateCell(rowIndex, cellIndex, e.target.value)
                              }
                              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm w-full"
                              rows="2"
                              placeholder={`Row ${rowIndex + 1}, Col ${cellIndex + 1}`}
                            />
                            {/* Remove Column Button */}
                            {cellIndex === 0 &&
                              tableData.headers &&
                              tableData.headers.length > 1 && (
                                <Button
                                  onClick={() => removeColumn(cellIndex)}
                                  size="sm"
                                  variant="outline"
                                  className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500 rounded-full"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500">
                          No row data
                        </div>
                      )}
                    </div>
                    {/* Remove Row Button */}
                    {tableData.data.length > 1 && (
                      <Button
                        onClick={() => removeRow(rowIndex)}
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500 rounded-full flex-shrink-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No table data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline" className="px-4 py-2">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Table
          </Button>
        </div>
      </div>
    );
  };

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* AI Generation Option */}
        <div
          onClick={() => {
            onClose();
            if (onAICreation) {
              onAICreation({ id: 'tables', title: 'Table' });
            }
          }}
          className="group relative p-6 border-2 border-purple-200 rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-50"
        >
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl opacity-100 transition-opacity duration-300"></div>

          <div className="flex items-start gap-5 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-purple-600 group-hover:from-purple-200 group-hover:to-pink-200 group-hover:text-purple-700 transition-all duration-300">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-purple-900 group-hover:text-purple-900 transition-colors duration-300 mb-2 flex items-center gap-2">
                Generate with AI
                <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                  Recommended
                </span>
              </h3>
              <p className="text-purple-700 group-hover:text-purple-800 transition-colors duration-300 leading-relaxed">
                Describe what you want and let AI create professional table
                content instantly
              </p>
            </div>
            <div className="flex-shrink-0 opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          {/* Enhanced Preview */}
          <div className="bg-white/70 rounded-xl border border-purple-200 p-4 group-hover:border-purple-300 transition-colors duration-300">
            <div className="flex items-center gap-2 text-purple-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-sm font-medium">
                AI-powered table generation
              </span>
            </div>
          </div>
        </div>

        {tableTemplates.map((template, index) => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="group relative p-6 border-2 border-gray-100 rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-start gap-5 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:from-blue-200 group-hover:to-purple-200 group-hover:text-blue-700 transition-all duration-300">
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-900 transition-colors duration-300 mb-2">
                  {template.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                  {template.description}
                </p>
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Enhanced Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-2 group-hover:border-blue-200 transition-colors duration-300">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Preview
                </div>
                <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Click to add
                </div>
              </div>
              <div
                className="w-full overflow-hidden max-w-full"
                style={{ maxWidth: '100%' }}
                dangerouslySetInnerHTML={{
                  __html: generateTableHTML(
                    template.defaultData,
                    template.id,
                    true
                  ),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render edit dialog when in edit mode
  if (isEditMode) {
    if (isLoading) {
      return (
        <Dialog open={true} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex items-center justify-center">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading table editor...</p>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    const template = tableTemplates.find(t => t.id === selectedTemplate);

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent
          className={`max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 ease-out transform ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Fixed Header */}
          <DialogHeader className="flex-shrink-0 sticky top-0 bg-white z-10 border-b border-gray-200 pb-4">
            <DialogTitle>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                    {template?.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Edit {template?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {template?.description}
                    </p>
                  </div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {template?.type === 'layout'
                ? renderColumnEditor(template, true)
                : renderDataTableEditor(template, true)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render sidebar for template selection
  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-start z-50 transition-all duration-300 ease-out ${
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
    >
      <div
        className={`bg-white h-full w-[480px] shadow-2xl flex flex-col transform transition-all duration-500 ease-out ${
          isVisible
            ? 'translate-x-0 opacity-100'
            : '-translate-x-full opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
              <Table className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Table Templates
              </h2>
              <p className="text-sm text-gray-600">
                Choose from beautiful designs
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTemplateSelection()}
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
