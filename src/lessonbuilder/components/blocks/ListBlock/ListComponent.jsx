import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import {
  List,
  ListOrdered,
  CheckSquare,
  X,
  Plus,
  Trash2,
  Save,
  Bold,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import devLogger from "@lessonbuilder/utils/devLogger";

// Separate component for contentEditable list item editor
const ListItemEditor = ({
  index,
  value,
  onUpdate,
  placeholder,
  onFocusChange,
}) => {
  const contentEditableRef = useRef(null);
  const isUserEditingRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Initialize content on mount or when value first becomes available
  useEffect(() => {
    if (contentEditableRef.current && !isInitializedRef.current && value) {
      contentEditableRef.current.innerHTML = value;
      isInitializedRef.current = true;
    }
  }, [value]);

  // Sync contentEditable with value when it changes externally (after initialization)
  useEffect(() => {
    if (
      contentEditableRef.current &&
      isInitializedRef.current &&
      contentEditableRef.current.innerHTML !== (value || "")
    ) {
      // Only update if user is not currently editing (to avoid cursor jumping)
      if (
        !isUserEditingRef.current &&
        document.activeElement !== contentEditableRef.current
      ) {
        contentEditableRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const handleInput = (e) => {
    isUserEditingRef.current = true;
    onUpdate(e.currentTarget.innerHTML);
  };

  const handleBlur = (e) => {
    // Update on blur to ensure latest content is saved
    onUpdate(e.currentTarget.innerHTML);
    isUserEditingRef.current = false;
  };

  const handleFocus = (e) => {
    isUserEditingRef.current = true;
    if (onFocusChange) {
      onFocusChange(contentEditableRef.current);
    }
  };

  const handleMouseUp = () => {
    // Save selection when user makes a selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && contentEditableRef.current) {
      const range = selection.getRangeAt(0);
      if (contentEditableRef.current.contains(range.commonAncestorContainer)) {
        if (onFocusChange) {
          onFocusChange(contentEditableRef.current);
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    // Support Ctrl+B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      const activeElement = document.activeElement;
      if (activeElement && activeElement.contentEditable === "true") {
        document.execCommand("bold", false, null);
        onUpdate(activeElement.innerHTML);
      }
    }
  };

  return (
    <>
      <div
        ref={contentEditableRef}
        id={`list-item-${index}`}
        contentEditable="true"
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] outline-none"
        style={{
          minHeight: "80px",
          maxHeight: "300px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
        data-placeholder={placeholder}
      />
      <style>{`
        #list-item-${index}:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </>
  );
};

const ListComponent = forwardRef(
  (
    {
      showListTemplateSidebar,
      setShowListTemplateSidebar,
      showListEditDialog,
      setShowListEditDialog,
      onListTemplateSelect,
      onListUpdate,
      editingListBlock,
      onAICreation,
    },
    ref,
  ) => {
    // List editing state
    const [listItems, setListItems] = useState([""]);
    const [listType, setListType] = useState("bulleted");
    const [checkedItems, setCheckedItems] = useState({});
    const [numberingStyle, setNumberingStyle] = useState("decimal"); // decimal, upper-roman, lower-roman, upper-alpha, lower-alpha
    const [bulletStyle, setBulletStyle] = useState("circle"); // circle, square, disc, arrow, star, diamond

    // Track the currently focused contentEditable element
    const focusedEditorRef = useRef(null);
    const selectionRef = useRef(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      setListItems,
      setListType,
      setCheckedItems,
      setNumberingStyle,
      setBulletStyle,
    }));

    // Numbering style options
    const numberingStyles = [
      { value: "decimal", label: "1, 2, 3", example: "1" },
      { value: "upper-roman", label: "I, II, III", example: "I" },
      { value: "lower-roman", label: "i, ii, iii", example: "i" },
      { value: "upper-alpha", label: "A, B, C", example: "A" },
      { value: "lower-alpha", label: "a, b, c", example: "a" },
    ];

    // Bullet style options
    const bulletStyles = [
      { value: "circle", label: "Circle", icon: "●" },
      { value: "square", label: "Square", icon: "■" },
      { value: "disc", label: "Disc", icon: "⬤" },
      { value: "arrow", label: "Arrow", icon: "▶" },
      { value: "star", label: "Star", icon: "★" },
      { value: "diamond", label: "Diamond", icon: "◆" },
    ];

    // Function to get numbering based on style
    const getNumbering = (index, style) => {
      const num = index + 1;
      switch (style) {
        case "upper-roman":
          return toRoman(num).toUpperCase();
        case "lower-roman":
          return toRoman(num).toLowerCase();
        case "upper-alpha":
          return String.fromCharCode(64 + num); // A, B, C...
        case "lower-alpha":
          return String.fromCharCode(96 + num); // a, b, c...
        case "decimal":
        default:
          return num.toString();
      }
    };

    // Convert number to Roman numerals
    const toRoman = (num) => {
      const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
      const symbols = [
        "M",
        "CM",
        "D",
        "CD",
        "C",
        "XC",
        "L",
        "XL",
        "X",
        "IX",
        "V",
        "IV",
        "I",
      ];
      let result = "";

      for (let i = 0; i < values.length; i++) {
        while (num >= values[i]) {
          result += symbols[i];
          num -= values[i];
        }
      }
      return result;
    };

    // Function to get bullet style component
    const getBulletComponent = (style) => {
      const baseClasses = "flex-shrink-0 mt-2 flex items-center justify-center";

      switch (style) {
        case "circle":
          return `<div class="${baseClasses}"><div class="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div></div>`;
        case "square":
          return `<div class="${baseClasses}"><div class="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm"></div></div>`;
        case "disc":
          return `<div class="${baseClasses}"><div class="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div></div>`;
        case "arrow":
          return `<div class="${baseClasses}"><div class="text-blue-500 font-bold text-sm">▶</div></div>`;
        case "star":
          return `<div class="${baseClasses}"><div class="text-blue-500 font-bold text-sm">★</div></div>`;
        case "diamond":
          return `<div class="${baseClasses}"><div class="text-blue-500 font-bold text-sm">◆</div></div>`;
        default:
          return `<div class="${baseClasses}"><div class="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div></div>`;
      }
    };

    // Function to render bullet in React component
    const renderBullet = (style) => {
      const baseClasses = "flex-shrink-0 mt-2 flex items-center justify-center";

      switch (style) {
        case "circle":
          return (
            <div className={baseClasses}>
              <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
            </div>
          );
        case "square":
          return (
            <div className={baseClasses}>
              <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm"></div>
            </div>
          );
        case "disc":
          return (
            <div className={baseClasses}>
              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
            </div>
          );
        case "arrow":
          return (
            <div className={baseClasses}>
              <div className="text-blue-500 font-bold text-sm">▶</div>
            </div>
          );
        case "star":
          return (
            <div className={baseClasses}>
              <div className="text-blue-500 font-bold text-sm">★</div>
            </div>
          );
        case "diamond":
          return (
            <div className={baseClasses}>
              <div className="text-blue-500 font-bold text-sm">◆</div>
            </div>
          );
        default:
          return (
            <div className={baseClasses}>
              <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
            </div>
          );
      }
    };

    // List templates with beautiful previews
    const listTemplates = [
      {
        id: "numbered_list",
        title: "Numbered List",
        description: "Ordered list with numbers for sequential content",
        icon: <ListOrdered className="h-5 w-5" />,
        type: "numbered",
        preview: (
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  1
                </div>
                <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                  First item - Add your content here. You can include text,
                  images, or key opportunities working for you.
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  2
                </div>
                <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                  List of essentials. You can also add or delete items as
                  needed.
                </div>
              </div>
            </div>
          </div>
        ),
        defaultContent: {
          items: [
            "First item - Add your content here. You can include text, images, or key opportunities working for you.",
            "List of essentials. You can also add or delete items as needed. Next, let's focus on how you can build better habits.",
            "Without distractions. The most rewarding adventures often start and end with meaningful connections and shared experiences.",
          ],
          listType: "numbered",
          numberingStyle: "decimal",
        },
      },
      {
        id: "checkbox_list",
        title: "Checkbox List",
        description: "Interactive checklist for tasks and to-do items",
        icon: <CheckSquare className="h-5 w-5" />,
        type: "checkbox",
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
                  First item - Add your content here. You can include text,
                  images, or key opportunities working for you.
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  <div className="w-5 h-5 border-2 border-pink-400 rounded bg-white"></div>
                </div>
                <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                  List of essentials. You can also add or delete items as
                  needed.
                </div>
              </div>
            </div>
          </div>
        ),
        defaultContent: {
          items: [
            "First item - Add your content here. You can include text, images, or key opportunities working for you.",
            "List of essentials. You can also add or delete items as needed. Next, let's focus on how you can build better habits.",
            "Without distractions. The most rewarding adventures often start and end with meaningful connections and shared experiences.",
          ],
          listType: "checkbox",
          checkedItems: {},
        },
      },
      {
        id: "bulleted_list",
        title: "Bulleted List",
        description: "Simple bullet points for general content organization",
        icon: <List className="h-5 w-5" />,
        type: "bulleted",
        preview: (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                {renderBullet("circle")}
                <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                  First item - Add your content here. You can include text,
                  images, or key opportunities working for you.
                </div>
              </div>
              <div className="flex items-start space-x-4">
                {renderBullet("circle")}
                <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                  List of essentials. You can also add or delete items as
                  needed.
                </div>
              </div>
            </div>
          </div>
        ),
        defaultContent: {
          items: [
            "First item - Add your content here. You can include text, images, or key opportunities working for you.",
            "List of essentials. You can also add or delete items as needed. Next, let's focus on how you can build better habits.",
            "Without distractions. The most rewarding adventures often start and end with meaningful connections and shared experiences.",
          ],
          listType: "bulleted",
          bulletStyle: "circle",
        },
      },
    ];

    // Initialize list editing state when dialog opens
    React.useEffect(() => {
      if (showListEditDialog && editingListBlock) {
        try {
          const listContent = JSON.parse(editingListBlock.content || "{}");
          setListItems(listContent.items || [""]);
          setListType(listContent.listType || "bulleted");
          setCheckedItems(listContent.checkedItems || {});
          setNumberingStyle(listContent.numberingStyle || "decimal");
          setBulletStyle(listContent.bulletStyle || "circle");
        } catch (e) {
          devLogger.error("Error parsing list content:", e);
          setListItems([""]);
          setListType("bulleted");
          setCheckedItems({});
          setNumberingStyle("decimal");
          setBulletStyle("circle");
        }
      }
    }, [showListEditDialog, editingListBlock]);

    const handleListTemplateSelect = (template) => {
      let htmlContent = "";
      const content = template.defaultContent;

      switch (template.type) {
        case "numbered":
          htmlContent = generateNumberedListHTML(
            content.items,
            content.numberingStyle || "decimal",
          );
          break;

        case "checkbox":
          htmlContent = `
          <div class="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
            <div class="space-y-4">
              ${content.items
                .map(
                  (item, index) => `
                <div class="checkbox-wrapper flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-pink-300/50 hover:shadow-md transition-all duration-200" data-checkbox-index="${index}">
                  <div class="flex-shrink-0 mt-1">
                    <div class="w-5 h-5 border-2 border-pink-400 rounded bg-white flex items-center justify-center cursor-pointer hover:border-pink-500 transition-colors checkbox-container" data-index="${index}" role="checkbox" aria-checked="false" tabindex="0">
                      <input type="checkbox" class="hidden checkbox-item" data-index="${index}" />
                      <div class="checkbox-visual w-4 h-4 bg-pink-500 rounded-sm flex items-center justify-center text-white text-xs font-semibold leading-none opacity-0 transition-opacity">
                        ✓
                      </div>
                    </div>
                  </div>
                  <div class="checkbox-text flex-1 text-gray-800 leading-relaxed">
                    ${item}
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `;
          break;

        case "bulleted":
          htmlContent = `
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <ul class="space-y-4 list-none">
              ${content.items
                .map(
                  (item) => `
                <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-blue-300/50 hover:shadow-md transition-all duration-200">
                  ${getBulletComponent(content.bulletStyle || "circle")}
                  <div class="flex-1 text-gray-800 leading-relaxed">
                    ${item}
                  </div>
                </li>
              `,
                )
                .join("")}
            </ul>
          </div>
        `;
          break;

        default:
          htmlContent = `
          <ul class="space-y-3 list-disc list-inside">
            ${content.items
              .map(
                (item) => `
              <li class="text-gray-800 leading-relaxed">${item}</li>
            `,
              )
              .join("")}
          </ul>
        `;
      }

      const newBlock = {
        id: `block_${Date.now()}`,
        block_id: `block_${Date.now()}`,
        type: "list",
        title: template.title,
        listType: template.type,
        content: JSON.stringify(content),
        html_css: htmlContent,
        details: {
          list_type: template.type,
          listType: template.type,
        },
      };

      onListTemplateSelect(newBlock);
      setShowListTemplateSidebar(false);
    };

    // Generate HTML for numbered lists with proper numbering style
    const generateNumberedListHTML = (items, style = "decimal") => {
      return `
      <div class="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
        <ol class="space-y-4 list-none">
          ${items
            .map(
              (item, index) => `
            <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-orange-300/50 hover:shadow-md transition-all duration-200">
              <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                ${getNumbering(index, style)}
              </div>
              <div class="flex-1 text-gray-800 leading-relaxed">
                ${item}
              </div>
            </li>
          `,
            )
            .join("")}
        </ol>
      </div>
    `;
    };

    const handleListUpdate = () => {
      if (!editingListBlock) return;

      const updatedContent = {
        items: listItems,
        listType: listType,
        checkedItems: listType === "checkbox" ? checkedItems : {},
        numberingStyle: listType === "numbered" ? numberingStyle : "decimal",
        bulletStyle: listType === "bulleted" ? bulletStyle : "circle",
      };

      // Generate updated HTML with current numbering style
      let updatedHtml = "";
      if (listType === "numbered") {
        updatedHtml = generateNumberedListHTML(listItems, numberingStyle);
      } else if (listType === "checkbox") {
        updatedHtml = `
        <div class="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
          <div class="space-y-4">
            ${listItems
              .map(
                (item, index) => `
              <div class="checkbox-wrapper flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-pink-300/50 hover:shadow-md transition-all duration-200" data-checkbox-index="${index}">
                <div class="flex-shrink-0 mt-1">
                  <div class="w-5 h-5 border-2 border-pink-400 rounded bg-white flex items-center justify-center cursor-pointer hover:border-pink-500 transition-colors checkbox-container" data-index="${index}" role="checkbox" aria-checked="${checkedItems[index] ? "true" : "false"}" tabindex="0">
                    <input type="checkbox" class="hidden checkbox-item" data-index="${index}" ${checkedItems[index] ? "checked" : ""} />
                    <div class="checkbox-visual w-4 h-4 bg-pink-500 rounded-sm flex items-center justify-center text-white text-xs font-semibold leading-none ${checkedItems[index] ? "opacity-100" : "opacity-0"} transition-opacity">
                      ✓
                    </div>
                  </div>
                </div>
                <div class="checkbox-text flex-1 text-gray-800 leading-relaxed ${checkedItems[index] ? "line-through text-gray-500" : ""}">
                  ${item}
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
      } else {
        // Bulleted list
        updatedHtml = `
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <ul class="space-y-4 list-none">
            ${listItems
              .map(
                (item) => `
              <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-blue-300/50 hover:shadow-md transition-all duration-200">
                ${getBulletComponent(bulletStyle)}
                <div class="flex-1 text-gray-800 leading-relaxed">
                  ${item}
                </div>
              </li>
            `,
              )
              .join("")}
          </ul>
        </div>
      `;
      }

      onListUpdate(
        editingListBlock.id,
        JSON.stringify(updatedContent),
        updatedHtml,
      );
      setShowListEditDialog(false);
    };

    const addListItem = () => {
      setListItems([...listItems, ""]);
    };

    const removeListItem = (index) => {
      if (listItems.length > 1) {
        const newItems = listItems.filter((_, i) => i !== index);
        setListItems(newItems);

        // Update checked items if removing from checkbox list
        if (listType === "checkbox") {
          const newCheckedItems = { ...checkedItems };
          delete newCheckedItems[index];
          // Reindex remaining items
          const reindexedCheckedItems = {};
          Object.keys(newCheckedItems).forEach((key) => {
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
      setCheckedItems((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    };

    // Function to apply bold formatting to selected text using execCommand
    const applyBoldFormatting = () => {
      // Try to get the focused editor from ref first
      let targetElement = focusedEditorRef.current;

      // If no ref, try to find any contentEditable element that might have focus or selection
      if (!targetElement) {
        // Check if there's a selection within a list item editor
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let node = range.commonAncestorContainer;

          // Walk up the DOM tree to find the contentEditable element
          while (node && node !== document.body) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              node.contentEditable === "true" &&
              node.id &&
              node.id.startsWith("list-item-")
            ) {
              targetElement = node;
              break;
            }
            node = node.parentNode;
          }
        }
      }

      // If still no target, try to find by checking all list item editors
      if (!targetElement) {
        for (let i = 0; i < listItems.length; i++) {
          const editor = document.getElementById(`list-item-${i}`);
          if (editor && editor.contentEditable === "true") {
            // Check if this editor has selection or contains the active element
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              if (editor.contains(range.commonAncestorContainer)) {
                targetElement = editor;
                break;
              }
            }
          }
        }
      }

      // If we found a target element, apply bold formatting
      if (
        targetElement &&
        targetElement.contentEditable === "true" &&
        targetElement.id &&
        targetElement.id.startsWith("list-item-")
      ) {
        // Save selection before focusing
        const selection = window.getSelection();
        let savedRange = null;
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          // Check if the selection is within our target element
          if (targetElement.contains(range.commonAncestorContainer)) {
            savedRange = range.cloneRange();
          }
        }

        // Focus the element
        targetElement.focus();

        // Use setTimeout to ensure the browser has processed the focus
        setTimeout(() => {
          const selection = window.getSelection();

          // Restore selection if we saved one
          if (savedRange) {
            try {
              selection.removeAllRanges();
              selection.addRange(savedRange);
            } catch (e) {
              // If selection restoration fails, try to select all text
              try {
                const range = document.createRange();
                range.selectNodeContents(targetElement);
                selection.removeAllRanges();
                selection.addRange(range);
              } catch (e2) {
                // If that also fails, just focus without selection
              }
            }
          }

          // Apply bold formatting
          try {
            const result = document.execCommand("bold", false, null);

            if (result) {
              // Update the list item with the new HTML content
              const index = parseInt(targetElement.id.split("-")[2]);
              updateListItem(index, targetElement.innerHTML);

              // Restore focus after state update
              setTimeout(() => {
                targetElement.focus();
              }, 0);
            }
          } catch (e) {
            devLogger.error("Error applying bold formatting:", e);
          }
        }, 10);
      } else {
        // If no target found, try to find and focus the first editor with selection
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let node = range.commonAncestorContainer;

          while (node && node !== document.body) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              node.contentEditable === "true" &&
              node.id &&
              node.id.startsWith("list-item-")
            ) {
              node.focus();
              setTimeout(() => {
                try {
                  const sel = window.getSelection();
                  sel.removeAllRanges();
                  sel.addRange(range.cloneRange());
                  document.execCommand("bold", false, null);
                  const index = parseInt(node.id.split("-")[2]);
                  updateListItem(index, node.innerHTML);
                } catch (e) {
                  devLogger.error("Error applying bold:", e);
                }
              }, 10);
              break;
            }
            node = node.parentNode;
          }
        }
      }
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
                    <h3 className="text-xl font-semibold text-gray-900">
                      List Types
                    </h3>
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
                {/* AI Generation Option */}
                <div
                  onClick={() => {
                    setShowListTemplateSidebar(false);
                    if (onAICreation) {
                      onAICreation({ id: "list", title: "List" });
                    }
                  }}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 rounded-xl border border-purple-200 hover:border-purple-300 overflow-hidden group bg-gradient-to-br from-purple-50 to-pink-50"
                >
                  {/* Template Header with AI Branding */}
                  <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 group-hover:from-purple-100 group-hover:to-pink-100 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow duration-200">
                          <svg
                            className="w-6 h-6 text-purple-600"
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
                        <div>
                          <h4 className="font-semibold text-purple-900 text-lg flex items-center gap-2">
                            Generate with AI
                            <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                              Recommended
                            </span>
                          </h4>
                          <p className="text-sm text-purple-700 mt-1">
                            Describe what you want and let AI create
                            professional list content instantly
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-purple-700 border border-purple-200 group-hover:border-purple-300 transition-all duration-200">
                        AI Powered
                      </div>
                    </div>
                  </div>

                  {/* Template Preview */}
                  <div className="p-6">
                    <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
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
                          AI-powered list generation
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

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
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {template.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {template.description}
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200 group-hover:border-blue-300 group-hover:text-blue-700 transition-all duration-200">
                          {template.type.charAt(0).toUpperCase() +
                            template.type.slice(1)}
                        </div>
                      </div>
                    </div>

                    {/* Template Preview */}
                    <div className="p-0">{template.preview}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* List Edit Dialog */}
        <Dialog open={showListEditDialog} onOpenChange={setShowListEditDialog}>
          <DialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            aria-describedby={undefined}
          >
            <DialogHeader>
              <DialogTitle>
                Edit{" "}
                {editingListBlock?.textType
                  ?.replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Current List Type Display (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Type
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {listType === "numbered" && (
                    <>
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <ListOrdered className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Numbered List
                        </span>
                        <p className="text-sm text-gray-600">
                          Ordered list with numbers for sequential content
                        </p>
                      </div>
                    </>
                  )}
                  {listType === "checkbox" && (
                    <>
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <CheckSquare className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Checkbox List
                        </span>
                        <p className="text-sm text-gray-600">
                          Interactive checklist for tasks and to-do items
                        </p>
                      </div>
                    </>
                  )}
                  {listType === "bulleted" && (
                    <>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <List className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Bulleted List
                        </span>
                        <p className="text-sm text-gray-600">
                          Simple bullet points for general content organization
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Numbering Style Selector (only for numbered lists) */}
              {listType === "numbered" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numbering Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {numberingStyles.map((style) => (
                      <div
                        key={style.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          numberingStyle === style.value
                            ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setNumberingStyle(style.value)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {style.example}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {style.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bullet Style Selector (only for bulleted lists) */}
              {listType === "bulleted" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bullet Style
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {bulletStyles.map((style) => (
                      <div
                        key={style.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          bulletStyle === style.value
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setBulletStyle(style.value)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 flex items-center justify-center">
                            <span className="text-blue-500 font-bold text-lg">
                              {style.icon}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {style.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* List Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    List Items
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        applyBoldFormatting();
                      }}
                      size="sm"
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-100"
                      title="Bold selected text (Ctrl+B)"
                    >
                      <Bold className="w-4 h-4 mr-1" />
                      Bold
                    </Button>
                    <Button
                      onClick={addListItem}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {listItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {listType === "numbered" && (
                        <div className="mt-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {getNumbering(index, numberingStyle)}
                          </div>
                        </div>
                      )}
                      {listType === "checkbox" && (
                        <div className="mt-3">
                          <input
                            type="checkbox"
                            checked={checkedItems[index] || false}
                            onChange={() => toggleCheckboxItem(index)}
                            className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                          />
                        </div>
                      )}
                      {listType === "bulleted" && (
                        <div className="mt-4">{renderBullet(bulletStyle)}</div>
                      )}
                      <div className="flex-1 relative">
                        <ListItemEditor
                          index={index}
                          value={item}
                          onUpdate={(html) => updateListItem(index, html)}
                          placeholder={`List item ${index + 1}`}
                          onFocusChange={(element) => {
                            focusedEditorRef.current = element;
                          }}
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
  },
);

ListComponent.displayName = "ListComponent";

export default ListComponent;
