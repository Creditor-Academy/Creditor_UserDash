import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const LinkDialog = ({
  isOpen,
  onClose,
  linkTitle,
  setLinkTitle,
  linkUrl,
  setLinkUrl,
  linkDescription,
  setLinkDescription,
  linkButtonText,
  setLinkButtonText,
  linkButtonStyle,
  setLinkButtonStyle,
  linkError,
  setLinkError,
  onAddLink
}) => {
  const handleDialogClose = () => {
    // Reset form state
    setLinkTitle('');
    setLinkUrl('');
    setLinkDescription('');
    setLinkButtonText('Visit Link');
    setLinkButtonStyle('primary');
    setLinkError('');
    onClose();
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setLinkUrl(url);
    
    if (url && !validateUrl(url)) {
      setLinkError('Please enter a valid URL');
    } else {
      setLinkError('');
    }
  };

  const buttonStyles = [
    { value: 'primary', label: 'Primary (Blue)', className: 'bg-blue-600 text-white' },
    { value: 'secondary', label: 'Secondary (Gray)', className: 'bg-gray-600 text-white' },
    { value: 'success', label: 'Success (Green)', className: 'bg-green-600 text-white' },
    { value: 'warning', label: 'Warning (Orange)', className: 'bg-orange-600 text-white' },
    { value: 'danger', label: 'Danger (Red)', className: 'bg-red-600 text-white' },
    { value: 'outline', label: 'Outline', className: 'border border-blue-600 text-blue-600 bg-white' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
          <p className="text-sm text-gray-500">Add an external link to your lesson</p>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter link title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={handleUrlChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                linkError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="https://example.com"
              required
            />
            {linkError && (
              <p className="text-sm text-red-600 mt-1">{linkError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              The full URL including http:// or https://
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={linkDescription}
              onChange={(e) => setLinkDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a description for the link (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={linkButtonText}
              onChange={(e) => setLinkButtonText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Visit Link"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {buttonStyles.map((style) => (
                <label key={style.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="buttonStyle"
                    value={style.value}
                    checked={linkButtonStyle === style.value}
                    onChange={(e) => setLinkButtonStyle(e.target.value)}
                    className="mr-3"
                  />
                  <div className={`px-3 py-1 rounded text-sm ${style.className}`}>
                    {style.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          {linkTitle && linkUrl && !linkError && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview:
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{linkTitle}</h3>
                {linkDescription && (
                  <p className="text-gray-700 mb-4">{linkDescription}</p>
                )}
                <div className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  buttonStyles.find(s => s.value === linkButtonStyle)?.className
                }`}>
                  {linkButtonText}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={onAddLink}
            disabled={!linkTitle || !linkUrl || linkError}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LinkDialog;