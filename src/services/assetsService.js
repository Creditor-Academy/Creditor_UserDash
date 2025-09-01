import api from './apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://sharebackend-sdkp.onrender.com';

// Organization Management APIs
export const organizationService = {
  // Create a new organization
  createOrganization: async (organizationData) => {
    try {
      const response = await api.post(`${API_BASE}/api/assets/createOrganization`, organizationData);
      return response.data;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  },

  // Get all organizations
  getOrganizations: async () => {
    try {
      const response = await api.get(`${API_BASE}/api/assets/getOrganizations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  // Edit an organization
  editOrganization: async (organizationId, organizationData) => {
    try {
      const response = await api.put(`${API_BASE}/api/assets/editorganization/${organizationId}`, organizationData);
      return response.data;
    } catch (error) {
      console.error('Error editing organization:', error);
      throw error;
    }
  },

  // Delete an organization
  deleteOrganization: async (organizationId) => {
    try {
      const response = await api.delete(`${API_BASE}/api/assets/deleteorganization/${organizationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  }
};

// Category Management APIs
export const categoryService = {
  // Create a new category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post(`${API_BASE}/api/assets/createcategory`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Get categories for a specific organization
  getCategories: async (organizationId) => {
    try {
      const response = await api.get(`${API_BASE}/api/assets/organizations/${organizationId}/getCategories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Edit a category
  editCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.put(`${API_BASE}/api/assets/editcategory/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error editing category:', error);
      throw error;
    }
  },

  // Delete a category
  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`${API_BASE}/api/assets/deletecategory/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

// Asset Management APIs
export const assetService = {
  // Create/upload a new asset
  createAsset: async (assetData) => {
    try {
      const formData = new FormData();
      formData.append('title', assetData.title);
      formData.append('description', assetData.description || '');
      formData.append('category_id', assetData.category_id);
      // Note: organization_id is not sent to backend as per controller requirements
      
      if (assetData.file) {
        // The backend middleware expects the field name to be 'assetfile'
        formData.append('assetfile', assetData.file, assetData.file.name);
      }

      // Debug: Log what we're sending
      console.log('Sending asset data:', {
        title: assetData.title,
        description: assetData.description || '',
        category_id: assetData.category_id,
        fileName: assetData.file?.name,
        fileSize: assetData.file?.size,
        fileType: assetData.file?.type,
        fieldName: 'assetfile' // The field name expected by backend middleware
      });

      const response = await api.post(`${API_BASE}/api/assets/create-asset`, formData);
      return response.data;
    } catch (error) {
      console.error('Error creating asset:', error);
      if (error?.response) {
        console.error('Upload error details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  },

  // Get assets based on organization and category
  getAssets: async (filters) => {
    try {
      const response = await api.post(`${API_BASE}/api/assets/getAssets`, filters);
      return response.data;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  },

  // Edit an asset
  editAsset: async (assetId, assetData) => {
    try {
      const response = await api.put(`${API_BASE}/api/assets/editasset/${assetId}`, assetData);
      return response.data;
    } catch (error) {
      console.error('Error editing asset:', error);
      throw error;
    }
  },

  // Delete an asset
  deleteAsset: async (assetId) => {
    try {
      const response = await api.delete(`${API_BASE}/api/assets/delete-asset/${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  },

  // Search assets globally across all organizations and categories
  searchAssets: async (searchTerm) => {
    try {
      const response = await api.post(`${API_BASE}/api/assets/search`, {
        query: searchTerm
      });
      return response.data;
    } catch (error) {
      console.error('Error searching assets:', error);
      throw error;
    }
  }
};

export default {
  organizationService,
  categoryService,
  assetService
};
