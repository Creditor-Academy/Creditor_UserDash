import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { X, Minus, MoreHorizontal, Circle, Edit, Palette } from 'lucide-react';

const DividerComponent = forwardRef(
  (
    {
      showDividerTemplateSidebar,
      setShowDividerTemplateSidebar,
      onDividerTemplateSelect,
      editingDividerBlock,
      onDividerUpdate,
    },
    ref
  ) => {
    const [selectedType, setSelectedType] = useState(null);

    // Edit dialog states
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);

    // Continue divider edit states
    const [continueText, setContinueText] = useState('CONTINUE');
    const [continueColor, setContinueColor] = useState('#2563eb');

    // Numbered divider edit states
    const [numberValue, setNumberValue] = useState('1');
    const [numberFormat, setNumberFormat] = useState('decimal');
    const [numberBgColor, setNumberBgColor] = useState('#f97316');

    // Spacer edit states
    const [spacerHeight, setSpacerHeight] = useState('32');
    const [spacerColor, setSpacerColor] = useState('#ffffff');

    // Number formatting options
    const numberFormats = [
      { id: 'decimal', label: '1, 2, 3', convert: num => num.toString() },
      {
        id: 'lower-alpha',
        label: 'a, b, c',
        convert: num => String.fromCharCode(96 + parseInt(num)),
      },
      {
        id: 'upper-alpha',
        label: 'A, B, C',
        convert: num => String.fromCharCode(64 + parseInt(num)),
      },
      {
        id: 'lower-roman',
        label: 'i, ii, iii',
        convert: num => toRoman(parseInt(num)).toLowerCase(),
      },
      {
        id: 'upper-roman',
        label: 'I, II, III',
        convert: num => toRoman(parseInt(num)).toUpperCase(),
      },
    ];

    // Convert number to Roman numerals
    const toRoman = num => {
      const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
      const symbols = [
        'M',
        'CM',
        'D',
        'CD',
        'C',
        'XC',
        'L',
        'XL',
        'X',
        'IX',
        'V',
        'IV',
        'I',
      ];
      let result = '';

      for (let i = 0; i < values.length; i++) {
        while (num >= values[i]) {
          result += symbols[i];
          num -= values[i];
        }
      }
      return result;
    };

    // Generate formatted number based on format type
    const getFormattedNumber = (value, format) => {
      const formatObj = numberFormats.find(f => f.id === format);
      if (!formatObj) return value;

      const numValue = parseInt(value) || 1;
      return formatObj.convert(numValue);
    };

    // Generate HTML content for continue divider
    const generateContinueHTML = (text, color) => {
      return `<div style="width: 100%; padding: 24px 0;">
      <div style="background-color: ${color}; color: white; text-align: center; padding: 16px 32px; font-weight: 600; font-size: 18px; letter-spacing: 0.1em; cursor: pointer; transition: background-color 0.2s; border: none;" onmouseover="this.style.backgroundColor='${adjustColor(color, -20)}'" onmouseout="this.style.backgroundColor='${color}'">
        ${text}
      </div>
    </div>`;
    };

    // Generate HTML content for numbered divider
    const generateNumberedHTML = (value, format, bgColor) => {
      const formattedNumber = getFormattedNumber(value, format);
      return `<div style="width: 100%; padding: 16px 0; position: relative;">
      <hr style="border: none; border-top: 2px solid #d1d5db; margin: 0;" />
      <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: white; padding: 0 12px;">
        <div style="width: 32px; height: 32px; background-color: ${bgColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
          ${formattedNumber}
        </div>
      </div>
    </div>`;
    };

    // Generate HTML content for spacer
    const generateSpacerHTML = (height, color) => {
      return `<div style="width: 100%; padding: ${height}px 0; background-color: ${color};">
      <!-- Spacer -->
    </div>`;
    };

    // Adjust color brightness
    const adjustColor = (color, amount) => {
      const usePound = color[0] === '#';
      const col = usePound ? color.slice(1) : color;
      const num = parseInt(col, 16);
      let r = (num >> 16) + amount;
      let g = ((num >> 8) & 0x00ff) + amount;
      let b = (num & 0x0000ff) + amount;
      r = r > 255 ? 255 : r < 0 ? 0 : r;
      g = g > 255 ? 255 : g < 0 ? 0 : g;
      b = b > 255 ? 255 : b < 0 ? 0 : b;
      return (
        (usePound ? '#' : '') +
        ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
      );
    };

    const dividerTypes = [
      {
        id: 'continue',
        title: 'Continue',
        description: 'Continue button divider',
        preview: (
          <div className="w-full py-4">
            <div className="bg-blue-600 text-white text-center py-4 px-8 font-semibold text-lg tracking-wide">
              CONTINUE
            </div>
          </div>
        ),
        content: `<div class="w-full py-6">
        <div class="bg-blue-600 hover:bg-blue-700 text-white text-center py-4 px-8 font-semibold text-lg tracking-wide cursor-pointer transition-colors">
          CONTINUE
        </div>
      </div>`,
        html_css: `<div style="width: 100%; padding: 24px 0;">
        <div style="background-color: #2563eb; color: white; text-align: center; padding: 16px 32px; font-weight: 600; font-size: 18px; letter-spacing: 0.1em; cursor: pointer; transition: background-color 0.2s; border: none;" onmouseover="this.style.backgroundColor='#1d4ed8'" onmouseout="this.style.backgroundColor='#2563eb'">
          CONTINUE
        </div>
      </div>`,
      },
      {
        id: 'divider',
        title: 'Divider',
        description: 'Simple horizontal line',
        preview: (
          <div className="w-full py-4">
            <hr className="border-gray-300 border-t-2" />
          </div>
        ),
        content: `<div class="w-full py-4">
        <hr class="border-gray-300 border-t-2" />
      </div>`,
        html_css: `<div style="width: 100%; padding: 16px 0;">
        <hr style="border: none; border-top: 2px solid #d1d5db; margin: 0;" />
      </div>`,
      },
      {
        id: 'numbered_divider',
        title: 'Numbered Divider',
        description: 'Divider with number in center',
        preview: (
          <div className="w-full py-4 relative">
            <hr className="border-gray-300 border-t-2" />
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
            </div>
          </div>
        ),
        content: `<div class="w-full py-4 relative">
        <hr class="border-gray-300 border-t-2" />
        <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3">
          <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            1
          </div>
        </div>
      </div>`,
        html_css: `<div style="width: 100%; padding: 16px 0; position: relative;">
        <hr style="border: none; border-top: 2px solid #d1d5db; margin: 0;" />
        <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: white; padding: 0 12px;">
          <div style="width: 32px; height: 32px; background-color: #f97316; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
            1
          </div>
        </div>
      </div>`,
      },
      {
        id: 'spacer',
        title: 'Spacer',
        description: 'Empty space divider with optional background color',
        preview: (
          <div className="w-full py-8">
            <div className="text-center text-gray-400 text-sm">
              ··· Spacer ···
            </div>
          </div>
        ),
        content: `<div class="w-full py-8">
        <!-- Spacer -->
      </div>`,
        html_css: `<div style="width: 100%; padding: 32px 0; background-color: #ffffff;">
        <!-- Spacer -->
      </div>`,
      },
    ];

    const handleTypeSelect = type => {
      if (onDividerTemplateSelect) {
        // Create the divider block immediately when clicked
        const dividerBlock = {
          id: `block_${Date.now()}`,
          block_id: `block_${Date.now()}`,
          type: 'divider',
          title: 'Divider',
          subtype: type.id,
          content: type.content,
          html_css: type.html_css,
          order: Date.now(),
        };
        onDividerTemplateSelect(dividerBlock);
      }
    };

    // Handle edit button click
    const handleEditClick = block => {
      setEditingBlock(block);

      if (block.subtype === 'continue') {
        // Extract current text and color from html_css or use defaults
        const textMatch = block.html_css?.match(/>([^<]+)</);
        const colorMatch = block.html_css?.match(/background-color:\s*([^;]+)/);

        setContinueText(textMatch ? textMatch[1].trim() : 'CONTINUE');
        setContinueColor(colorMatch ? colorMatch[1].trim() : '#2563eb');
      } else if (block.subtype === 'numbered_divider') {
        // Extract current number, format, and color from html_css or use defaults
        const numberMatch = block.html_css?.match(
          />([^<]+)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>$/
        );
        const colorMatch = block.html_css?.match(/background-color:\s*([^;]+)/);

        setNumberValue(numberMatch ? numberMatch[1].trim() : '1');
        setNumberBgColor(colorMatch ? colorMatch[1].trim() : '#f97316');

        // Determine format based on the extracted number
        const extractedNumber = numberMatch ? numberMatch[1].trim() : '1';
        if (/^[a-z]$/.test(extractedNumber)) {
          setNumberFormat('lower-alpha');
        } else if (/^[A-Z]$/.test(extractedNumber)) {
          setNumberFormat('upper-alpha');
        } else if (/^[ivxlcdm]+$/.test(extractedNumber.toLowerCase())) {
          setNumberFormat(
            extractedNumber === extractedNumber.toLowerCase()
              ? 'lower-roman'
              : 'upper-roman'
          );
        } else {
          setNumberFormat('decimal');
        }
      } else if (block.subtype === 'spacer') {
        // Extract current height and color from html_css or use defaults
        const heightMatch = block.html_css?.match(/padding:\s*(\d+)px/);
        const colorMatch = block.html_css?.match(/background-color:\s*([^;]+)/);

        setSpacerHeight(heightMatch ? heightMatch[1] : '32');
        setSpacerColor(colorMatch ? colorMatch[1].trim() : '#ffffff');
      }

      setShowEditDialog(true);
    };

    // Handle save changes
    const handleSaveChanges = () => {
      if (!editingBlock || !onDividerUpdate) return;

      let updatedHtmlCss = '';
      let updatedContent = '';
      let editParams = {};

      if (editingBlock.subtype === 'continue') {
        updatedHtmlCss = generateContinueHTML(continueText, continueColor);
        updatedContent = `<div class="w-full py-6">
        <div class="text-white text-center py-4 px-8 font-semibold text-lg tracking-wide cursor-pointer transition-colors" style="background-color: ${continueColor};">
          ${continueText}
        </div>
      </div>`;
        editParams = { text: continueText, color: continueColor };
      } else if (editingBlock.subtype === 'numbered_divider') {
        updatedHtmlCss = generateNumberedHTML(
          numberValue,
          numberFormat,
          numberBgColor
        );
        const formattedNumber = getFormattedNumber(numberValue, numberFormat);
        updatedContent = `<div class="w-full py-4 relative">
        <hr class="border-gray-300 border-t-2" />
        <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style="background-color: ${numberBgColor};">
            ${formattedNumber}
          </div>
        </div>
      </div>`;
        editParams = {
          value: numberValue,
          format: numberFormat,
          bgColor: numberBgColor,
        };
      } else if (editingBlock.subtype === 'spacer') {
        updatedHtmlCss = generateSpacerHTML(spacerHeight, spacerColor);
        updatedContent = `<div class="w-full" style="padding: ${spacerHeight}px 0; background-color: ${spacerColor};">
        <!-- Spacer -->
      </div>`;
        editParams = { height: spacerHeight, color: spacerColor };
      }

      // Call the update handler with the new content
      onDividerUpdate(editingBlock.id, {
        ...editingBlock,
        html_css: updatedHtmlCss,
        content: updatedContent,
        // Store edit parameters for future edits
        editParams: editParams,
      });

      setShowEditDialog(false);
      setEditingBlock(null);
    };

    // Handle dialog close
    const handleDialogClose = () => {
      setShowEditDialog(false);
      setEditingBlock(null);
    };

    // Expose edit functionality to parent component
    useImperativeHandle(ref, () => ({
      editDivider: block => {
        handleEditClick(block);
      },
    }));

    return (
      <>
        {/* Divider Template Sidebar */}
        {showDividerTemplateSidebar && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
              onClick={() => setShowDividerTemplateSidebar(false)}
            />

            {/* Sidebar */}
            <div className="relative bg-white w-96 h-full shadow-xl overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Minus className="h-6 w-6" />
                    Divider Types
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDividerTemplateSidebar(false)}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    ×
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Choose a divider type to add to your lesson
                </p>
              </div>

              <div className="p-6 space-y-4">
                {dividerTypes.map(type => (
                  <div
                    key={type.id}
                    onClick={() => handleTypeSelect(type)}
                    className="p-5 border rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-blue-600 mt-1 group-hover:text-blue-700">
                        <Minus className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 text-base">
                          {type.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>

                    {/* Mini Preview */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      {type.preview}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>
                Edit{' '}
                {editingBlock?.subtype === 'continue'
                  ? 'Continue Button'
                  : editingBlock?.subtype === 'numbered_divider'
                    ? 'Numbered Divider'
                    : 'Spacer'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {editingBlock?.subtype === 'continue' && (
                <>
                  {/* Continue Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={continueText}
                      onChange={e => setContinueText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter button text"
                    />
                  </div>

                  {/* Continue Color Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={continueColor}
                        onChange={e => setContinueColor(e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={continueColor}
                        onChange={e => setContinueColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div
                        className="text-white text-center py-3 px-6 font-semibold text-base tracking-wide rounded"
                        style={{ backgroundColor: continueColor }}
                      >
                        {continueText}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {editingBlock?.subtype === 'numbered_divider' && (
                <>
                  {/* Number Value Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number Value
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={numberValue}
                      onChange={e => setNumberValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1"
                    />
                  </div>

                  {/* Number Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number Format
                    </label>
                    <select
                      value={numberFormat}
                      onChange={e => setNumberFormat(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {numberFormats.map(format => (
                        <option key={format.id} value={format.id}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Number Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={numberBgColor}
                        onChange={e => setNumberBgColor(e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={numberBgColor}
                        onChange={e => setNumberBgColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#f97316"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="relative py-4">
                        <hr className="border-gray-300 border-t-2" />
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: numberBgColor }}
                          >
                            {getFormattedNumber(numberValue, numberFormat)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {editingBlock?.subtype === 'spacer' && (
                <>
                  {/* Spacer Height Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spacer Height (px)
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="200"
                      value={spacerHeight}
                      onChange={e => setSpacerHeight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="32"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Height in pixels (8-200)
                    </p>
                  </div>

                  {/* Spacer Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={spacerColor}
                        onChange={e => setSpacerColor(e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={spacerColor}
                        onChange={e => setSpacerColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#ffffff"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use transparent or any color (e.g., #ffffff for white)
                    </p>
                  </div>

                  {/* Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="text-xs text-gray-500 text-center mb-2">
                        Spacer with {spacerHeight}px height
                      </div>
                      <div
                        className="w-full rounded"
                        style={{
                          padding: `${spacerHeight}px 0`,
                          backgroundColor: spacerColor,
                          border:
                            spacerColor === '#ffffff' ||
                            spacerColor.toLowerCase() === '#fff'
                              ? '1px dashed #d1d5db'
                              : 'none',
                        }}
                      >
                        {/* Spacer preview */}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

export default DividerComponent;
