import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  RotateCcw,
  RotateCw,
  Crop,
  ZoomIn,
  ZoomOut,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import devLogger from '@lessonbuilder/utils/devLogger';

const ImageEditor = ({
  isOpen,
  onClose,
  imageFile,
  onSave,
  title = 'Edit Image',
}) => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState('move'); // 'move', 'resize-nw', 'resize-ne', 'resize-sw', 'resize-se'
  const [imageScale, setImageScale] = useState(1);

  useEffect(() => {
    if (imageFile && isOpen) {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          // Initialize crop area to full image
          setCropArea({ x: 0, y: 0, width: img.width, height: img.height });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, isOpen]);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate image dimensions to fit canvas
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = image.width / image.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imageAspect > canvasAspect) {
      drawWidth = canvas.width * imageScale;
      drawHeight = (canvas.width / imageAspect) * imageScale;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height * imageScale;
      drawWidth = canvas.height * imageAspect * imageScale;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Save context
    ctx.save();

    // Apply rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw the FULL image first
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    // Restore context
    ctx.restore();

    // Draw crop overlay to show what will be CUT OUT
    drawCropOverlay(ctx, offsetX, offsetY, drawWidth, drawHeight);
  }, [image, rotation, brightness, contrast, saturation, cropArea, imageScale]);

  const drawCropOverlay = useCallback(
    (ctx, imgX, imgY, imgWidth, imgHeight) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Calculate crop area in canvas coordinates
      const scaleX = imgWidth / image.width;
      const scaleY = imgHeight / image.height;

      const cropX = imgX + cropArea.x * scaleX;
      const cropY = imgY + cropArea.y * scaleY;
      const cropW = cropArea.width * scaleX;
      const cropH = cropArea.height * scaleY;

      // Draw dark overlay over areas that will be CUT OUT (cropped away)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';

      // Top area (above crop)
      ctx.fillRect(0, 0, canvas.width, cropY);
      // Bottom area (below crop)
      ctx.fillRect(
        0,
        cropY + cropH,
        canvas.width,
        canvas.height - (cropY + cropH)
      );
      // Left area (left of crop)
      ctx.fillRect(0, cropY, cropX, cropH);
      // Right area (right of crop)
      ctx.fillRect(cropX + cropW, cropY, canvas.width - (cropX + cropW), cropH);

      // Draw bright border around the area that will be KEPT
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(cropX, cropY, cropW, cropH);

      // Draw corner handles
      const handleSize = 12;
      ctx.fillStyle = '#00ff00';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      // Corner handles
      // Top-left handle
      ctx.fillRect(
        cropX - handleSize / 2,
        cropY - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        cropX - handleSize / 2,
        cropY - handleSize / 2,
        handleSize,
        handleSize
      );

      // Top-right handle
      ctx.fillRect(
        cropX + cropW - handleSize / 2,
        cropY - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        cropX + cropW - handleSize / 2,
        cropY - handleSize / 2,
        handleSize,
        handleSize
      );

      // Bottom-left handle
      ctx.fillRect(
        cropX - handleSize / 2,
        cropY + cropH - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        cropX - handleSize / 2,
        cropY + cropH - handleSize / 2,
        handleSize,
        handleSize
      );

      // Bottom-right handle
      ctx.fillRect(
        cropX + cropW - handleSize / 2,
        cropY + cropH - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        cropX + cropW - handleSize / 2,
        cropY + cropH - handleSize / 2,
        handleSize,
        handleSize
      );

      // Center edge handles
      // Top center handle
      ctx.fillRect(
        cropX + cropW / 2 - handleSize / 2,
        cropY - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        cropX + cropW / 2 - handleSize / 2,
        cropY - handleSize / 2,
        handleSize,
        handleSize
      );

      // Bottom center handle
      ctx.fillRect(
        cropX + cropW / 2 - handleSize / 2,
        cropY + cropH - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        cropX + cropW / 2 - handleSize / 2,
        cropY + cropH - handleSize / 2,
        handleSize,
        handleSize
      );

      // Left center handle
      ctx.fillRect(
        cropX - handleSize / 2,
        cropY + cropH / 2 - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        cropX - handleSize / 2,
        cropY + cropH / 2 - handleSize / 2,
        handleSize,
        handleSize
      );

      // Right center handle
      ctx.fillRect(
        cropX + cropW - handleSize / 2,
        cropY + cropH / 2 - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        cropX + cropW - handleSize / 2,
        cropY + cropH / 2 - handleSize / 2,
        handleSize,
        handleSize
      );

      // Add text to show what will be kept
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('KEEP THIS AREA', cropX + cropW / 2, cropY - 10);
    },
    [image, cropArea]
  );

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  const getMousePos = useCallback(e => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const getCropAreaInCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return { x: 0, y: 0, width: 0, height: 0 };

    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = image.width / image.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imageAspect > canvasAspect) {
      drawWidth = canvas.width * imageScale;
      drawHeight = (canvas.width / imageAspect) * imageScale;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height * imageScale;
      drawWidth = canvas.height * imageAspect * imageScale;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    const scaleX = drawWidth / image.width;
    const scaleY = drawHeight / image.height;

    return {
      x: offsetX + cropArea.x * scaleX,
      y: offsetY + cropArea.y * scaleY,
      width: cropArea.width * scaleX,
      height: cropArea.height * scaleY,
    };
  }, [image, cropArea, imageScale]);

  const getHandleAt = useCallback(
    (mouseX, mouseY) => {
      const canvasArea = getCropAreaInCanvas();
      const handleSize = 12;
      const tolerance = 8;

      // Check corner handles first
      if (
        Math.abs(mouseX - canvasArea.x) < tolerance &&
        Math.abs(mouseY - canvasArea.y) < tolerance
      ) {
        return 'resize-nw'; // Top-left
      }
      if (
        Math.abs(mouseX - (canvasArea.x + canvasArea.width)) < tolerance &&
        Math.abs(mouseY - canvasArea.y) < tolerance
      ) {
        return 'resize-ne'; // Top-right
      }
      if (
        Math.abs(mouseX - canvasArea.x) < tolerance &&
        Math.abs(mouseY - (canvasArea.y + canvasArea.height)) < tolerance
      ) {
        return 'resize-sw'; // Bottom-left
      }
      if (
        Math.abs(mouseX - (canvasArea.x + canvasArea.width)) < tolerance &&
        Math.abs(mouseY - (canvasArea.y + canvasArea.height)) < tolerance
      ) {
        return 'resize-se'; // Bottom-right
      }

      // Check center edge handles
      // Top center handle
      if (
        Math.abs(mouseX - (canvasArea.x + canvasArea.width / 2)) < tolerance &&
        Math.abs(mouseY - canvasArea.y) < tolerance
      ) {
        return 'resize-n'; // Top center
      }
      // Bottom center handle
      if (
        Math.abs(mouseX - (canvasArea.x + canvasArea.width / 2)) < tolerance &&
        Math.abs(mouseY - (canvasArea.y + canvasArea.height)) < tolerance
      ) {
        return 'resize-s'; // Bottom center
      }
      // Left center handle
      if (
        Math.abs(mouseX - canvasArea.x) < tolerance &&
        Math.abs(mouseY - (canvasArea.y + canvasArea.height / 2)) < tolerance
      ) {
        return 'resize-w'; // Left center
      }
      // Right center handle
      if (
        Math.abs(mouseX - (canvasArea.x + canvasArea.width)) < tolerance &&
        Math.abs(mouseY - (canvasArea.y + canvasArea.height / 2)) < tolerance
      ) {
        return 'resize-e'; // Right center
      }

      // Check if inside crop area for moving
      if (
        mouseX >= canvasArea.x &&
        mouseX <= canvasArea.x + canvasArea.width &&
        mouseY >= canvasArea.y &&
        mouseY <= canvasArea.y + canvasArea.height
      ) {
        return 'move';
      }

      return null;
    },
    [getCropAreaInCanvas]
  );

  const handleMouseDown = useCallback(
    e => {
      e.preventDefault();
      const mousePos = getMousePos(e);
      const handle = getHandleAt(mousePos.x, mousePos.y);

      if (handle) {
        devLogger.debug('Mouse down on:', handle);
        setIsDragging(true);
        setDragType(handle);
        setDragStart(mousePos);

        // Change cursor based on handle type
        const canvas = canvasRef.current;
        if (canvas) {
          if (handle.startsWith('resize')) {
            // Set appropriate cursor based on resize direction
            switch (handle) {
              case 'resize-nw':
              case 'resize-se':
                canvas.style.cursor = 'nw-resize';
                break;
              case 'resize-ne':
              case 'resize-sw':
                canvas.style.cursor = 'ne-resize';
                break;
              case 'resize-n':
              case 'resize-s':
                canvas.style.cursor = 'ns-resize';
                break;
              case 'resize-w':
              case 'resize-e':
                canvas.style.cursor = 'ew-resize';
                break;
              default:
                canvas.style.cursor = 'nw-resize';
            }
          } else if (handle === 'move') {
            canvas.style.cursor = 'move';
          }
        }
      }
    },
    [getMousePos, getHandleAt]
  );

  const handleMouseMove = useCallback(
    e => {
      const mousePos = getMousePos(e);
      const handle = getHandleAt(mousePos.x, mousePos.y);

      // Update cursor based on hover
      const canvas = canvasRef.current;
      if (canvas && !isDragging) {
        if (handle && handle.startsWith('resize')) {
          // Set appropriate cursor based on resize direction
          switch (handle) {
            case 'resize-nw':
            case 'resize-se':
              canvas.style.cursor = 'nw-resize';
              break;
            case 'resize-ne':
            case 'resize-sw':
              canvas.style.cursor = 'ne-resize';
              break;
            case 'resize-n':
            case 'resize-s':
              canvas.style.cursor = 'ns-resize';
              break;
            case 'resize-w':
            case 'resize-e':
              canvas.style.cursor = 'ew-resize';
              break;
            default:
              canvas.style.cursor = 'nw-resize';
          }
        } else if (handle === 'move') {
          canvas.style.cursor = 'move';
        } else {
          canvas.style.cursor = 'default';
        }
      }

      if (!isDragging || !image || !dragType) return;

      e.preventDefault();
      const deltaX = mousePos.x - dragStart.x;
      const deltaY = mousePos.y - dragStart.y;

      devLogger.debug('Mouse move - delta:', deltaX, deltaY, 'type:', dragType);

      // Convert canvas coordinates to image coordinates
      const canvasElement = canvasRef.current;
      if (!canvasElement) return;

      const scaleX = image.width / canvasElement.width;
      const scaleY = image.height / canvasElement.height;

      if (dragType === 'move') {
        // Move the entire crop area
        setCropArea(prev => {
          const newX = Math.max(
            0,
            Math.min(image.width - prev.width, prev.x + deltaX * scaleX)
          );
          const newY = Math.max(
            0,
            Math.min(image.height - prev.height, prev.y + deltaY * scaleY)
          );
          devLogger.debug('Moving crop area:', {
            x: newX,
            y: newY,
            width: prev.width,
            height: prev.height,
          });
          return {
            x: newX,
            y: newY,
            width: prev.width,
            height: prev.height,
          };
        });
      } else if (dragType.startsWith('resize')) {
        // Resize the crop area
        setCropArea(prev => {
          let newX = prev.x;
          let newY = prev.y;
          let newWidth = prev.width;
          let newHeight = prev.height;

          switch (dragType) {
            case 'resize-nw': // Top-left
              newX = Math.max(
                0,
                Math.min(prev.x + prev.width - 50, prev.x + deltaX * scaleX)
              );
              newY = Math.max(
                0,
                Math.min(prev.y + prev.height - 50, prev.y + deltaY * scaleY)
              );
              newWidth = prev.width - (newX - prev.x);
              newHeight = prev.height - (newY - prev.y);
              break;
            case 'resize-ne': // Top-right
              newY = Math.max(
                0,
                Math.min(prev.y + prev.height - 50, prev.y + deltaY * scaleY)
              );
              newWidth = Math.max(
                50,
                Math.min(image.width - prev.x, prev.width + deltaX * scaleX)
              );
              newHeight = prev.height - (newY - prev.y);
              break;
            case 'resize-sw': // Bottom-left
              newX = Math.max(
                0,
                Math.min(prev.x + prev.width - 50, prev.x + deltaX * scaleX)
              );
              newWidth = prev.width - (newX - prev.x);
              newHeight = Math.max(
                50,
                Math.min(image.height - prev.y, prev.height + deltaY * scaleY)
              );
              break;
            case 'resize-se': // Bottom-right
              newWidth = Math.max(
                50,
                Math.min(image.width - prev.x, prev.width + deltaX * scaleX)
              );
              newHeight = Math.max(
                50,
                Math.min(image.height - prev.y, prev.height + deltaY * scaleY)
              );
              break;
            case 'resize-n': // Top center
              newY = Math.max(
                0,
                Math.min(prev.y + prev.height - 50, prev.y + deltaY * scaleY)
              );
              newHeight = prev.height - (newY - prev.y);
              break;
            case 'resize-s': // Bottom center
              newHeight = Math.max(
                50,
                Math.min(image.height - prev.y, prev.height + deltaY * scaleY)
              );
              break;
            case 'resize-w': // Left center
              newX = Math.max(
                0,
                Math.min(prev.x + prev.width - 50, prev.x + deltaX * scaleX)
              );
              newWidth = prev.width - (newX - prev.x);
              break;
            case 'resize-e': // Right center
              newWidth = Math.max(
                50,
                Math.min(image.width - prev.x, prev.width + deltaX * scaleX)
              );
              break;
          }

          devLogger.debug('Resizing crop area:', {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          });
          return { x: newX, y: newY, width: newWidth, height: newHeight };
        });
      }

      setDragStart(mousePos);
    },
    [isDragging, image, dragType, dragStart, getMousePos, getHandleAt]
  );

  const handleMouseUp = useCallback(e => {
    e.preventDefault();
    devLogger.debug('Mouse up');
    setIsDragging(false);
    setDragType('move');

    // Reset cursor
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'default';
    }
  }, []);

  const rotateLeft = () => {
    devLogger.debug('Rotate left');
    setRotation(prev => prev - 90);
  };

  const rotateRight = () => {
    devLogger.debug('Rotate right');
    setRotation(prev => prev + 90);
  };

  const zoomIn = () => {
    setImageScale(prev => Math.min(prev * 1.2, 3));
  };

  const zoomOut = () => {
    setImageScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const resetImage = () => {
    setRotation(0);
    setImageScale(1);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    if (image) {
      setCropArea({ x: 0, y: 0, width: image.width, height: image.height });
    }
  };

  const handleSave = async () => {
    if (!image) return;

    setIsProcessing(true);
    try {
      // Create a new canvas for the final CROPPED image
      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');

      // Set final canvas size to the CROPPED area only
      finalCanvas.width = cropArea.width;
      finalCanvas.height = cropArea.height;

      // Apply all transformations
      finalCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

      // Apply rotation
      finalCtx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
      finalCtx.rotate((rotation * Math.PI) / 180);
      finalCtx.translate(-finalCanvas.width / 2, -finalCanvas.height / 2);

      // Draw ONLY the cropped portion of the image
      finalCtx.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height, // Source: crop area from original image
        0,
        0,
        finalCanvas.width,
        finalCanvas.height // Destination: full final canvas
      );

      // Convert to blob
      finalCanvas.toBlob(
        blob => {
          const editedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
          });
          onSave(editedFile);
          setIsProcessing(false);
          toast.success('Image cropped and edited successfully!');
        },
        imageFile.type,
        0.9
      );
    } catch (error) {
      devLogger.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    resetImage();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Select the area you want to KEEP. Everything outside the green
            rectangle will be CUT OUT (cropped away).
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 h-[500px]">
          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ touchAction: 'none' }}
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={rotateLeft}
                title="Rotate Left"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rotateRight}
                title="Rotate Right"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <Button
                variant="outline"
                size="sm"
                onClick={resetImage}
                title="Reset"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Adjustments Panel */}
          <div className="w-80 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Brightness: {brightness}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={e => setBrightness(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Contrast: {contrast}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={e => setContrast(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Saturation: {saturation}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={e => setSaturation(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Crop Area (What You'll Keep)
              </h4>
              <div className="text-xs text-gray-500 space-y-2">
                <div className="flex justify-between">
                  <span>X:</span>
                  <span>{Math.round(cropArea.x)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Y:</span>
                  <span>{Math.round(cropArea.y)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Width:</span>
                  <span>{Math.round(cropArea.width)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Height:</span>
                  <span>{Math.round(cropArea.height)}</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                <p>
                  • <span className="text-green-600 font-bold">Green area</span>{' '}
                  = What you'll KEEP
                </p>
                <p>
                  • <span className="text-gray-600">Dark area</span> = What will
                  be CUT OUT
                </p>
                <p>• Drag green rectangle to move crop area</p>
                <p>• Drag corner handles to resize diagonally</p>
                <p>• Drag center handles to resize horizontally/vertically</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cropping...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Crop & Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditor;
