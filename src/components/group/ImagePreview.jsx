import React from "react";
import { Button } from "@/components/ui/button";
import { X, Send } from "lucide-react";

export function ImagePreview({ 
  imageFile, 
  onSend, 
  onCancel, 
  isSending = false 
}) {
  const [imageUrl, setImageUrl] = React.useState(null);

  React.useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      
      // Cleanup function to revoke the object URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [imageFile]);

  if (!imageFile || !imageUrl) return null;

  return (
    <div className="border-t bg-gray-50 p-4 flex-shrink-0">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Image Preview</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-4">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-w-full max-h-48 rounded-lg object-contain mx-auto"
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSend}
            disabled={isSending}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            {isSending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Image
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ImagePreview;
