import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image, 
  Wand2, 
  Download, 
  Copy, 
  Trash2, 
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Camera
} from 'lucide-react';
import LoadingBuffer from '../LoadingBuffer';
import { generateAndUploadCourseImage } from '../../services/aiCourseService';
import { useAIFeatureAccess, withAIFeatureAccess } from './AIFeatureAccess';

const AIImageGenerator = ({ onFeatureUse, usageInfo }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('1024x1024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const { hasAccess, trackUsage } = useAIFeatureAccess();

  const styles = [
    { id: 'realistic', name: 'Realistic', preview: '📸' },
    { id: 'illustration', name: 'Illustration', preview: '🎨' },
    { id: 'cartoon', name: 'Cartoon', preview: '🎭' },
    { id: 'abstract', name: 'Abstract', preview: '🌀' },
    { id: 'minimal', name: 'Minimal', preview: '⚪' },
    { id: 'vintage', name: 'Vintage', preview: '📻' }
  ];

  const sizes = [
    { id: '512x512', name: 'Square (512×512)' },
    { id: '1024x1024', name: 'Large Square (1024×1024)' },
    { id: '1024x768', name: 'Landscape (1024×768)' },
    { id: '768x1024', name: 'Portrait (768×1024)' }
  ];

  const generateImage = useCallback(async () => {
    if (!prompt.trim()) return;

    // Track feature usage
    if (onFeatureUse) onFeatureUse();
    trackUsage('IMAGE_GENERATION');

    setIsGenerating(true);
    console.log('🎨 Starting image generation with prompt:', prompt);

    // Create a unique request ID to track this generation
    const requestId = Date.now() + Math.random();
    
    try {
      // Use the new backend-integrated service for image generation and S3 upload
      const result = await generateAndUploadCourseImage(prompt, { style, size });
      
      if (result.success) {
        console.log('🎉 Image generated and uploaded to S3:', result.data);
        
        const newImage = {
          id: requestId,
          prompt,
          style,
          size,
          url: result.data.s3Url, // Use S3 URL instead of original URL
          originalUrl: result.data.originalUrl,
          fileName: result.data.fileName,
          fileSize: result.data.fileSize,
          createdAt: result.data.createdAt,
          isLoading: false
        };

        setGeneratedImages(prev => [newImage, ...prev]);
        console.log('✅ Image added to gallery:', newImage);
      } else {
        throw new Error(result.error || 'Failed to generate and upload image');
      }

    } catch (error) {
      console.error('❌ Image generation failed:', error);
      
      // Add error state instead of fallback image
      const errorImage = {
        id: requestId,
        prompt,
        style,
        size,
        url: null,
        createdAt: new Date().toISOString(),
        hasError: true,
        errorMessage: error.message || 'Generation failed'
      };

      console.log('🔄 Adding error state:', errorImage);
      setGeneratedImages(prev => [errorImage, ...prev]);
    } finally {
      setIsGenerating(false);
      console.log('🏁 Image generation process completed');
    }
  }, [prompt, style, size]);

  const handleSuccessfulGeneration = useCallback((response, requestId) => {
    // Extract dimensions from size
    const [width, height] = size.split('x').map(Number);

    // Handle different response formats from Bytez API
    let imageUrl;
    if (response && response.images && Array.isArray(response.images)) {
      imageUrl = response.images[0]?.url || response.images[0];
    } else if (response && response.output && Array.isArray(response.output)) {
      imageUrl = response.output[0]?.url || response.output[0];
    } else if (response && response.url) {
      imageUrl = response.url;
    } else if (typeof response === 'string') {
      imageUrl = response;
    } else if (Array.isArray(response)) {
      imageUrl = response[0]?.url || response[0];
    } else {
      console.warn('⚠️ Unexpected response format:', response);
      return; // Don't update if format is unexpected
    }
    
    // Validate URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.warn('⚠️ Invalid image URL received');
      return;
    }

    console.log('🖼️ Final image URL:', imageUrl);

    const newImage = {
      id: requestId,
      prompt,
      style,
      size,
      url: imageUrl,
      createdAt: new Date().toISOString(),
      isGenerated: true
    };

    console.log('✅ Updating with real generated image:', newImage);

    // Replace placeholder/fallback with real image, or add new if no placeholder
    setGeneratedImages(prev => {
      const existingIndex = prev.findIndex(img => img.id === requestId);
      if (existingIndex >= 0) {
        // Replace existing placeholder/fallback
        const updated = [...prev];
        updated[existingIndex] = newImage;
        console.log('🔄 Replaced placeholder with real image');
        return updated;
      } else {
        // Add as new image
        console.log('🔄 Adding new generated image');
        return [newImage, ...prev];
      }
    });
  }, [prompt, style, size]);

  const deleteImage = (id) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(url);
  };

  const downloadImage = async (url, prompt) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `ai-image-${prompt.slice(0, 20).replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-image-${prompt.slice(0, 20).replace(/\s+/g, '-')}.jpg`;
      link.target = '_blank';
      link.click();
    }
  };

  const insertIntoCourse = (image) => {
    // This would integrate with the course content editor
    console.log('Inserting image into course:', image);
    // Implementation would depend on the course editor structure
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Generate Course Images</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate (e.g., 'A modern classroom with students learning programming')"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {styles.map((styleOption) => (
                  <button
                    key={styleOption.id}
                    onClick={() => setStyle(styleOption.id)}
                    className={`p-3 text-center border rounded-md transition-colors ${
                      style === styleOption.id
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-lg mb-1">{styleOption.preview}</div>
                    <div className="text-xs">{styleOption.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
              >
                {sizes.map((sizeOption) => (
                  <option key={sizeOption.id} value={sizeOption.id}>
                    {sizeOption.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            {isGenerating ? 'Generating Image...' : 'Generate Image'}
          </button>
        </div>
      </div>

      {/* Generated Images Grid */}
      {generatedImages.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold mb-4">Generated Images ({generatedImages.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((image) => (
              <motion.div
                key={`image-${image.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-gray-100 rounded-lg overflow-hidden"
              >
                {image.isLoading ? (
                  // Loading state with buffer
                  <div className="w-full h-48">
                    <LoadingBuffer 
                      type="generation" 
                      message="Generating your image..." 
                      showSparkles={true}
                    />
                  </div>
                ) : image.hasError ? (
                  // Error state
                  <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-red-700 font-medium">Generation Failed</p>
                      <p className="text-xs text-red-600 mt-1">{image.errorMessage}</p>
                      <button
                        onClick={() => {
                          setPrompt(image.prompt);
                          setStyle(image.style);
                          setSize(image.size);
                          generateImage();
                        }}
                        className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : (
                  // Successfully generated image
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', image.url);
                      // Update state to show error instead of broken image
                      setGeneratedImages(prev => prev.map(img => 
                        img.id === image.id 
                          ? { ...img, hasError: true, errorMessage: 'Failed to load image' }
                          : img
                      ));
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', image.url);
                    }}
                  />
                )}
                
                {/* Overlay with actions - only show for successfully generated images */}
                {!image.isLoading && !image.hasError && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                      <button
                        onClick={() => insertIntoCourse(image)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Insert into Course"
                      >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadImage(image.url, image.prompt)}
                      className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyImageUrl(image.url)}
                      className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                )}

                {/* Image info */}
                <div className="p-3">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {image.prompt}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="capitalize">{image.style}</span>
                    <span>{image.size}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {generatedImages.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No images generated yet</p>
          <p className="text-sm">Create your first AI-generated course image above</p>
        </div>
      )}
    </div>
  );
};

// Export with AI Feature Access protection
export default withAIFeatureAccess(AIImageGenerator, 'IMAGE_GENERATION');
