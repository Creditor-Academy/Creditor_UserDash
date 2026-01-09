import React, { useState, useEffect } from 'react';
import {
  Image,
  Search,
  Loader2,
  Grid3x3,
  List,
  X,
  Check,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  fetchImagesFromS3,
  formatFileSize,
  formatDate,
} from '@/services/imageGalleryService';
import { toast } from 'react-hot-toast';

const ImageGallery = ({ onSelectImage, onClose }) => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredImages(images);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = images.filter(
        img =>
          img.fileName.toLowerCase().includes(query) ||
          img.folder.toLowerCase().includes(query)
      );
      setFilteredImages(filtered);
    }
  }, [searchQuery, images]);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchImagesFromS3();
      if (result.success) {
        setImages(result.images);
        setFilteredImages(result.images);
      } else {
        throw new Error('Failed to load images');
      }
    } catch (err) {
      console.error('Error loading images:', err);
      setError(err.message);
      toast.error('Failed to load images from gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = image => {
    setSelectedImage(image);
  };

  const handleConfirmSelection = () => {
    if (selectedImage && onSelectImage) {
      onSelectImage(selectedImage);
      // Don't close here - let the parent handle it after type selection
    }
  };

  const handleDownload = async (image, e) => {
    e.stopPropagation(); // Prevent image selection when clicking download

    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.fileName || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  const handleRefresh = () => {
    loadImages();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Loading images from gallery...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-4">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Image Gallery</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {filteredImages.length} images
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="h-8 w-8 p-0"
              title={viewMode === 'grid' ? 'List view' : 'Grid view'}
            >
              {viewMode === 'grid' ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3x3 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
              title="Refresh gallery"
            >
              <Loader2 className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search images by name or folder..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </div>

      {/* Image Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Image className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium mb-1">No images found</p>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? 'Try a different search term'
                : 'Upload images to see them here'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredImages.map((img, index) => (
              <div
                key={img.key || index}
                onClick={() => handleImageSelect(img)}
                className={`
                  relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                  ${
                    selectedImage?.url === img.url
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={img.url}
                    alt={img.fileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={e => {
                      e.target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {selectedImage?.url === img.url && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="bg-blue-500 rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">
                    {img.fileName}
                  </p>
                  <p className="text-white/80 text-xs truncate">{img.folder}</p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => handleDownload(img, e)}
                    className="h-7 w-7 p-0 bg-black/60 hover:bg-black/80 text-white"
                    title="Download image"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <div className="bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {formatFileSize(img.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredImages.map((img, index) => (
              <div
                key={img.key || index}
                onClick={() => handleImageSelect(img)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    selectedImage?.url === img.url
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={img.url}
                    alt={img.fileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={e => {
                      e.target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {img.fileName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{img.folder}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">
                      {formatFileSize(img.size)}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">
                      {formatDate(img.lastModified)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => handleDownload(img, e)}
                    className="h-8 w-8 p-0"
                    title="Download image"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {selectedImage?.url === img.url && (
                    <div>
                      <Check className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with selection button */}
      {selectedImage && (
        <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                Selected: {selectedImage.fileName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {selectedImage.folder}
              </p>
            </div>
            <Button onClick={handleConfirmSelection} className="flex-shrink-0">
              Use This Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
