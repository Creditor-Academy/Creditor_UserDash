import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import devLogger from '@lessonbuilder/utils/devLogger';

/**
 * Regenerate Comparison Dialog
 * Shows old vs new content side by side for comparison before replacing
 */
const RegenerateComparisonDialog = ({
  isOpen,
  onClose,
  oldBlock,
  newBlock,
  blockType,
  onKeepOld,
  onUseNew,
  onRegenerate,
  isRegenerating = false,
}) => {
  const [selectedVersion, setSelectedVersion] = useState(null); // 'old' or 'new'

  const handleUseNew = () => {
    if (onUseNew && newBlock) {
      onUseNew(newBlock);
      toast.success('Content updated with new version!');
      onClose();
    }
  };

  const handleKeepOld = () => {
    if (onKeepOld && oldBlock) {
      onKeepOld(oldBlock);
      toast.success('Kept original content');
      onClose();
    }
  };

  const handleRegenerate = async () => {
    if (onRegenerate) {
      await onRegenerate();
    }
  };

  // Render block content for comparison
  const renderBlockContent = (block, version) => {
    if (!block) {
      // Only log warning if dialog is actually open (not during initial render)
      if (isOpen) {
        devLogger.warn(
          `${version} block is null or undefined in comparison dialog`,
          {
            isOpen,
            hasOldBlock: !!oldBlock,
            hasNewBlock: !!newBlock,
          }
        );
      }
      return (
        <div className="text-gray-400 text-sm italic text-center py-8">
          No content available
        </div>
      );
    }

    devLogger.debug(`Rendering ${version} block content:`, {
      type: block.type,
      hasHtmlCss: !!block.html_css,
      htmlCssLength: block.html_css?.length || 0,
      hasContent: !!block.content,
      contentType: typeof block.content,
      hasDetails: !!block.details,
      detailsKeys: block.details ? Object.keys(block.details) : [],
      allKeys: Object.keys(block),
    });

    // Extract content based on block type
    let content = null;
    let htmlContent = null;

    // Priority: html_css > content > details.content
    if (block.html_css) {
      htmlContent = block.html_css;
    } else if (block.content) {
      if (typeof block.content === 'string') {
        content = block.content;
      } else if (typeof block.content === 'object' && block.content.content) {
        content = block.content.content;
      }
    } else if (block.details?.content) {
      content = block.details.content;
    } else if (block.details?.caption_html) {
      content = block.details.caption_html;
    }

    // Handle specific block types
    if (block.type === 'statement') {
      // Statement blocks: use html_css if available, otherwise content or details.content
      const statementContent =
        htmlContent || content || block.details?.content || block.text || '';

      if (statementContent) {
        return (
          <div className="space-y-3">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: statementContent }}
            />
          </div>
        );
      }
    }

    if (block.type === 'text') {
      // Text blocks: use html_css or content
      const textContent = htmlContent || content || '';
      if (textContent) {
        return (
          <div className="space-y-3">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: textContent }}
            />
          </div>
        );
      }
    }

    if (block.type === 'image') {
      // Image blocks: show image with caption
      // Extract image URL from multiple sources
      let imageUrl =
        block.imageUrl ||
        block.details?.image_url ||
        block.content?.imageUrl ||
        block.content?.url ||
        '';

      // Last resort: extract from html_css
      if (!imageUrl && block.html_css) {
        try {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = block.html_css;
          const img = tempDiv.querySelector('img');
          imageUrl = img?.src || img?.getAttribute('src') || '';
        } catch (e) {
          devLogger.warn('Failed to extract image URL from HTML:', e);
        }
      }

      // Extract text/caption
      const imageText =
        block.text ||
        block.details?.caption_html ||
        block.details?.caption ||
        block.imageDescription ||
        '';

      return (
        <div className="space-y-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={block.imageTitle || block.details?.alt_text || 'Image'}
              className="w-full max-w-md mx-auto rounded-lg shadow-sm"
              onError={e => {
                devLogger.warn('Image failed to load:', imageUrl);
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              No image URL found
            </div>
          )}
          {block.imageTitle && (
            <h4 className="font-semibold text-gray-800 text-sm text-center">
              {block.imageTitle}
            </h4>
          )}
          {imageText && (
            <div
              className="text-sm text-gray-600 text-center prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: imageText }}
            />
          )}
          {!imageText && (block.imageDescription || block.details?.caption) && (
            <p className="text-sm text-gray-600 italic text-center">
              {block.imageDescription || block.details?.caption}
            </p>
          )}
          {htmlContent && (
            <div
              className="mt-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>
      );
    }

    if (block.type === 'interactive') {
      return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {block.subtype || block.template || 'Interactive content'}
          </p>
          {htmlContent && (
            <div
              className="mt-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
          {!htmlContent && content && (
            <div
              className="mt-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      );
    }

    // Default: render html_css or content
    if (htmlContent) {
      return (
        <div className="space-y-3">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      );
    }

    if (content) {
      return (
        <div className="space-y-3">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      );
    }

    // Fallback: show block info with debug data
    devLogger.warn(`Could not render content for ${block.type} block:`, {
      type: block.type,
      hasHtmlCss: !!block.html_css,
      hasContent: !!block.content,
      hasDetails: !!block.details,
      blockKeys: Object.keys(block),
    });

    return (
      <div className="text-gray-500 text-sm space-y-2 py-4">
        <p className="italic text-center">
          {block.type} content (preview not available)
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-gray-400 mt-2">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
              {JSON.stringify(
                {
                  type: block.type,
                  id: block.id || block.block_id,
                  hasHtmlCss: !!block.html_css,
                  htmlCssPreview: block.html_css?.substring(0, 100),
                  hasContent: !!block.content,
                  contentPreview:
                    typeof block.content === 'string'
                      ? block.content.substring(0, 100)
                      : 'object',
                  hasDetails: !!block.details,
                  detailsKeys: block.details ? Object.keys(block.details) : [],
                },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    );
  };

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      devLogger.debug('Comparison dialog opened:', {
        hasOldBlock: !!oldBlock,
        hasNewBlock: !!newBlock,
        oldBlockType: oldBlock?.type,
        newBlockType: newBlock?.type,
        oldBlockId: oldBlock?.id || oldBlock?.block_id,
        newBlockId: newBlock?.id || newBlock?.block_id,
        oldBlockHtmlCss: !!oldBlock?.html_css,
        oldBlockHtmlCssLength: oldBlock?.html_css?.length || 0,
        oldBlockContent: !!oldBlock?.content,
        oldBlockContentLength: oldBlock?.content?.length || 0,
        oldBlockDetails: !!oldBlock?.details,
        oldBlockKeys: oldBlock ? Object.keys(oldBlock) : [],
        newBlockHtmlCss: !!newBlock?.html_css,
        newBlockContent: !!newBlock?.content,
      });
    }
  }, [isOpen, oldBlock, newBlock]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Compare Content Versions
          </DialogTitle>
          <DialogDescription>
            Review the original and regenerated content. Choose which version to
            keep.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          {/* Original Content */}
          <div
            className={`border-2 rounded-lg p-4 transition-all ${
              selectedVersion === 'old'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
            onClick={() => setSelectedVersion('old')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gray-100">
                  Original
                </Badge>
                {selectedVersion === 'old' && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {renderBlockContent(oldBlock, 'old')}
            </div>
          </div>

          {/* New Content */}
          <div
            className={`border-2 rounded-lg p-4 transition-all ${
              selectedVersion === 'new'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
            onClick={() => setSelectedVersion('new')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Regenerated
                </Badge>
                {selectedVersion === 'new' && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {isRegenerating ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600">Regenerating...</p>
                </div>
              ) : (
                renderBlockContent(newBlock, 'new')
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2"
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Regenerate Again
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleKeepOld}>
              <X className="h-4 w-4 mr-2" />
              Keep Original
            </Button>
            <Button
              onClick={handleUseNew}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Use New Version
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegenerateComparisonDialog;
