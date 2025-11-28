import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

const TextSelectionToolbar = ({
  selection,
  onFormat,
  onLink,
  onImage,
  onList,
  onAlign,
  onColor,
  onBackground,
  onFontSize,
  onFontFamily,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showFontFamilyPicker, setShowFontFamilyPicker] = useState(false);
  const toolbarRef = useRef(null);

  const fontSizes = [
    '12px',
    '14px',
    '16px',
    '18px',
    '20px',
    '24px',
    '32px',
    '48px',
  ];
  const fontFamilies = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Roboto',
    'Serif',
    'Sans-serif',
  ];
  const colors = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#FFA500',
    '#800080',
    '#008000',
    '#FFC0CB',
    '#A52A2A',
    '#808080',
    '#FFD700',
  ];

  useEffect(() => {
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const rect = range.getBoundingClientRect();
        const toolbarHeight = 50;

        // Position toolbar above the selection
        setPosition({
          x: rect.left + rect.width / 2 - 200, // Center the toolbar
          y: rect.top - toolbarHeight - 10,
        });

        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  }, [selection]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setShowColorPicker(false);
        setShowFontSizePicker(false);
        setShowFontFamilyPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1"
      style={{
        left: Math.max(10, position.x),
        top: Math.max(10, position.y),
      }}
    >
      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="h-8 w-8 p-0"
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="h-8 w-8 p-0"
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Font Family */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFontFamilyPicker(!showFontFamilyPicker)}
          className="h-8 px-2 text-xs"
          title="Font Family"
        >
          <Type className="h-4 w-4 mr-1" />
          Font
        </Button>
        {showFontFamilyPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[150px]">
            {fontFamilies.map(font => (
              <button
                key={font}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                onClick={() => {
                  onFontFamily(font);
                  setShowFontFamilyPicker(false);
                }}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font Size */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFontSizePicker(!showFontSizePicker)}
          className="h-8 px-2 text-xs"
          title="Font Size"
        >
          <Type className="h-4 w-4 mr-1" />
          Size
        </Button>
        {showFontSizePicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[100px]">
            {fontSizes.map(size => (
              <button
                key={size}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                onClick={() => {
                  onFontSize(size);
                  setShowFontSizePicker(false);
                }}
                style={{ fontSize: size }}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('bold')}
        className="h-8 w-8 p-0"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('italic')}
        className="h-8 w-8 p-0"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('underline')}
        className="h-8 w-8 p-0"
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('strikethrough')}
        className="h-8 w-8 p-0"
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Color */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="h-8 w-8 p-0"
          title="Text Color"
        >
          <Palette className="h-4 w-4" />
        </Button>
        {showColorPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
            <div className="grid grid-cols-5 gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onColor(color);
                    setShowColorPicker(false);
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Alignment */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAlign('left')}
        className="h-8 w-8 p-0"
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAlign('center')}
        className="h-8 w-8 p-0"
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAlign('right')}
        className="h-8 w-8 p-0"
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAlign('justify')}
        className="h-8 w-8 p-0"
        title="Justify"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onList('bullet')}
        className="h-8 w-8 p-0"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onList('ordered')}
        className="h-8 w-8 p-0"
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Special Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('blockquote')}
        className="h-8 w-8 p-0"
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('code')}
        className="h-8 w-8 p-0"
        title="Code"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onLink}
        className="h-8 w-8 p-0"
        title="Insert Link"
      >
        <Link className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onImage}
        className="h-8 w-8 p-0"
        title="Insert Image"
      >
        <Image className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TextSelectionToolbar;
