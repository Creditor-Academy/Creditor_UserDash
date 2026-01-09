// Image Upload Service - Real S3 implementation
// Uploads images to S3 via backend API

import { api } from "./apiClient";

/**
 * Upload an image file to S3 via backend API
 * @param {File} file - The image file to upload
 * @param {Object} options - Additional options for upload
 * @returns {Promise<Object>} Upload response with S3 image URL
 */
export async function uploadImage(file, options = {}) {
  try {
    console.log("🚀 S3 upload requested for file:", file.name);

    // Validate file type/size (keep validation for UX)
    const isPdf = options.type === "pdf" || file.type === "application/pdf";
    if (isPdf) {
      const validPdfTypes = ["application/pdf"];
      if (!validPdfTypes.includes(file.type)) {
        throw new Error("Please upload a valid PDF file");
      }
      // PDF size limit (200MB)
      if (file.size > 200 * 1024 * 1024) {
        throw new Error("PDF size should be less than 200MB");
      }
    } else {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(file.type)) {
        throw new Error("Please upload only JPG, PNG, GIF, or WebP images");
      }
      // Image size limit (50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error("Image size should be less than 50MB");
      }
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append("resource", file);

    // Add optional parameters
    if (options.folder) {
      formData.append("folder", options.folder);
    }
    if (options.public !== undefined) {
      formData.append("public", options.public.toString());
    }
    if (options.type) {
      formData.append("type", options.type);
    }

    console.log("📤 Uploading to S3 via backend API...");
    console.log("Upload options:", {
      fileName: file.name,
      fileSize: file.size,
      folder: options.folder || "default",
      public: options.public !== undefined ? options.public : true,
      type: options.type || "image",
    });

    // Choose AI-specific endpoint for AI-generated assets
    const uploadEndpoint = options.isAIGenerated
      ? "/api/ai/upload-resource"
      : "/api/resource/upload-resource";

    // Upload to S3 via backend API
    const response = await api.post(uploadEndpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 600000, // 10 minute timeout for large files
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const responseMessage =
      response.data?.message || response.data?.errorMessage || "";
    const normalizedResponseMessage = responseMessage.toLowerCase();
    if (
      normalizedResponseMessage.includes("limit exceeded") ||
      normalizedResponseMessage.includes("storage limit")
    ) {
      const limitError = new Error(responseMessage || "Storage limit exceeded");
      limitError.code = "STORAGE_LIMIT_EXCEEDED";
      limitError.isStorageLimitExceeded = true;
      throw limitError;
    }

    console.log("✅ S3 upload successful:", response.data);

    // Extract S3 URL from response
    const s3Url =
      response.data?.data?.url || response.data?.url || response.data?.imageUrl;

    if (!s3Url) {
      throw new Error("No S3 URL returned from backend");
    }

    // Return standardized response
    return {
      success: true,
      imageUrl: s3Url,
      fileName:
        response.data?.data?.fileName || response.data?.fileName || file.name,
      fileSize:
        response.data?.data?.fileSize || response.data?.fileSize || file.size,
      fieldUsed: options.fieldName || "resource",
      message: "Image uploaded successfully to S3",
      s3Url: s3Url,
      uploadedToS3: true,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ S3 upload failed:", error);

    // Enhanced error handling
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message ||
        error.response.data?.errorMessage ||
        error.message;

      const normalizedMessage = (message || "").toLowerCase();
      if (
        normalizedMessage.includes("limit exceeded") ||
        normalizedMessage.includes("storage limit")
      ) {
        const limitError = new Error(message || "Storage limit exceeded");
        limitError.code = "STORAGE_LIMIT_EXCEEDED";
        limitError.isStorageLimitExceeded = true;
        throw limitError;
      }

      if (status === 413) {
        throw new Error("File too large for upload");
      } else if (status === 415) {
        throw new Error("Unsupported file type");
      } else if (status === 401) {
        throw new Error("Authentication required for upload");
      } else if (status === 403) {
        throw new Error("Permission denied for upload");
      } else {
        throw new Error(`Upload failed: ${message}`);
      }
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Upload timeout - file may be too large");
    } else {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}

/**
 * Upload multiple images to S3 via backend API
 * @param {File[]} files - Array of image files to upload
 * @param {Object} options - Additional options for upload
 * @returns {Promise<Object[]>} Array of upload responses
 */
export async function uploadMultipleImages(files, options = {}) {
  try {
    console.log("🚀 Multiple S3 upload requested for", files.length, "files");

    const uploadPromises = files.map((file) => uploadImage(file, options));
    const results = await Promise.allSettled(uploadPromises);

    return results.map((result, index) => ({
      file: files[index],
      success: result.status === "fulfilled",
      data: result.status === "fulfilled" ? result.value : null,
      error: result.status === "rejected" ? result.reason.message : null,
    }));
  } catch (error) {
    console.error("❌ Error uploading multiple images to S3:", error);
    throw error;
  }
}

export default {
  uploadImage,
  uploadMultipleImages,
};
