import React, { useState, useEffect } from "react";
import { Link as LinkIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LinkComponent = ({
  showLinkDialog,
  setShowLinkDialog,
  onLinkUpdate,
  editingLinkBlock,
}) => {
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [linkButtonText, setLinkButtonText] = useState("Visit Link");
  const [linkButtonStyle, setLinkButtonStyle] = useState("primary");
  const [linkError, setLinkError] = useState("");

  // Reset form when dialog opens/closes or when editing a different block
  useEffect(() => {
    if (showLinkDialog && editingLinkBlock) {
      // Editing mode - populate with existing data
      setLinkTitle(editingLinkBlock.linkTitle || "");
      setLinkUrl(editingLinkBlock.linkUrl || "");
      setLinkDescription(editingLinkBlock.linkDescription || "");
      setLinkButtonText(editingLinkBlock.linkButtonText || "Visit Link");
      setLinkButtonStyle(editingLinkBlock.linkButtonStyle || "primary");
      setLinkError("");
    } else if (showLinkDialog && !editingLinkBlock) {
      // New link mode - reset form
      resetForm();
    }
  }, [showLinkDialog, editingLinkBlock]);

  const resetForm = () => {
    setLinkTitle("");
    setLinkUrl("");
    setLinkDescription("");
    setLinkButtonText("Visit Link");
    setLinkButtonStyle("primary");
    setLinkError("");
  };

  const handleLinkDialogClose = () => {
    setShowLinkDialog(false);
    resetForm();
  };

  const handleLinkInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setLinkTitle(value);
    } else if (name === "url") {
      setLinkUrl(value);
    } else if (name === "description") {
      setLinkDescription(value);
    } else if (name === "buttonText") {
      setLinkButtonText(value);
    } else if (name === "buttonStyle") {
      setLinkButtonStyle(value);
    }
  };

  const handleAddLink = () => {
    if (!linkTitle || !linkUrl || !linkButtonText) {
      setLinkError("Please fill in all required fields");
      return;
    }

    try {
      // This will throw if URL is invalid
      new URL(linkUrl);
    } catch (e) {
      setLinkError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    // Generate HTML content for display
    const buttonStyles = {
      primary: "background-color: #3B82F6; color: white; border: none;",
      secondary: "background-color: #6B7280; color: white; border: none;",
      outline:
        "background-color: transparent; color: #3B82F6; border: 2px solid #3B82F6;",
    };

    const htmlContent = `
      <div style="padding: 16px; border: 1px solid #E5E7EB; border-radius: 8px; background-color: #F9FAFB;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1F2937;">${linkTitle}</h3>
        ${linkDescription ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: #6B7280;">${linkDescription}</p>` : ""}
        <a href="${linkUrl}" target="_blank" rel="noopener noreferrer"
           style="display: inline-block; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; ${buttonStyles[linkButtonStyle] || buttonStyles.primary}">
          ${linkButtonText}
        </a>
      </div>
    `;

    const newBlock = {
      id: editingLinkBlock?.id || `link-${Date.now()}`,
      block_id: editingLinkBlock?.id || `link-${Date.now()}`,
      type: "link",
      title: "Link",
      linkTitle: linkTitle,
      linkUrl: linkUrl,
      linkDescription: linkDescription,
      linkButtonText: linkButtonText,
      linkButtonStyle: linkButtonStyle,
      timestamp: new Date().toISOString(),
      html_css: htmlContent,
    };

    // Call the parent's onLinkUpdate callback
    onLinkUpdate(newBlock);

    // Close dialog and reset
    handleLinkDialogClose();
  };

  return (
    <>
      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={handleLinkDialogClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLinkBlock ? "Edit Link" : "Add Link"}
            </DialogTitle>
            <DialogDescription>
              {editingLinkBlock
                ? "Update the link details and settings."
                : "Add a link to an external resource or website."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={linkTitle}
                onChange={handleLinkInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter link title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="url"
                value={linkUrl}
                onChange={handleLinkInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://www.example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: https://www.example.com
              </p>
              {linkError && (
                <p className="text-sm text-red-500 mt-1">{linkError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={linkDescription}
                onChange={handleLinkInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a description for your link (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="buttonText"
                value={linkButtonText}
                onChange={handleLinkInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Visit Link"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Style
              </label>
              <select
                name="buttonStyle"
                value={linkButtonStyle}
                onChange={handleLinkInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="primary">Primary (Blue)</option>
                <option value="secondary">Secondary (Gray)</option>
                <option value="success">Success (Green)</option>
                <option value="warning">Warning (Orange)</option>
                <option value="danger">Danger (Red)</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleLinkDialogClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddLink}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingLinkBlock ? "Save" : "Add Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

LinkComponent.displayName = "LinkComponent";

export default LinkComponent;
