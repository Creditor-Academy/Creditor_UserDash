import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Image, 
  Video, 
  FileText, 
  Trash2, 
  Download,
  Copy,
  Eye,
  Calendar,
  FileImage,
  FileVideo,
  Plus,
  Edit,
  Building,
  Globe,
  Users,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { organizationService, categoryService, assetService } from "@/services/assetsService";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterOrganization, setFilterOrganization] = useState("all");
  const [pendingOrg, setPendingOrg] = useState("all");
  const [pendingCat, setPendingCat] = useState("all");

  

  const [selectedResources, setSelectedResources] = useState([]);
  const [showOrganizationModal, setShowOrganizationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    organization: ""
  });

  // Organizations and categories from backend
  const [organizations, setOrganizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [organizationCategories, setOrganizationCategories] = useState({}); // New: categories organized by organization
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch organizations and categories from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First fetch organizations
      const orgsResponse = await organizationService.getOrganizations();
      
      // Transform backend data to match frontend structure
      const transformedOrgs = orgsResponse.data?.map(org => ({
        id: org.id || org._id,
        name: org.name,
        description: org.description,
        type: org.name === "Global" ? "global" : "organization"
      })) || [];

      setOrganizations(transformedOrgs);

      // Fetch categories for all organizations
      const categoriesByOrg = {};
      for (const org of transformedOrgs) {
        try {
          const catsResponse = await categoryService.getCategories(org.id);
          const transformedCats = catsResponse.data?.map(cat => ({
            id: cat.id || cat._id,
            name: cat.name,
            color: getCategoryColor(cat.name),
            organization_id: org.id
          })) || [];
          categoriesByOrg[org.id] = transformedCats;
        } catch (error) {
          console.error(`Error fetching categories for organization ${org.id}:`, error);
          categoriesByOrg[org.id] = [];
        }
      }
      
      setOrganizationCategories(categoriesByOrg);
      
      // Set initial categories (for Global organization or first organization)
      const globalOrg = transformedOrgs.find(org => org.type === "global");
      const initialOrg = globalOrg || transformedOrgs[0];
      if (initialOrg) {
        if (globalOrg) {
          // For Global, show all categories from all organizations
          const allCategories = Object.values(categoriesByOrg).flat();
          setCategories(allCategories);
        } else {
          setCategories(categoriesByOrg[initialOrg.id] || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch data');
      toast({
        title: "Error",
        description: "Failed to fetch organizations and categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch categories for a specific organization
  const fetchCategoriesForOrganization = async (organizationId) => {
    try {
      const catsResponse = await categoryService.getCategories(organizationId);
      const transformedCats = catsResponse.data?.map(cat => ({
        id: cat.id || cat._id,
        name: cat.name,
        color: getCategoryColor(cat.name),
        organization_id: organizationId
      })) || [];
      
      // Update both the general categories and the organization-specific categories
      setCategories(transformedCats);
      setOrganizationCategories(prev => ({
        ...prev,
        [organizationId]: transformedCats
      }));
    } catch (error) {
      console.error('Error fetching categories for organization:', error);
      setCategories([]);
      setOrganizationCategories(prev => ({
        ...prev,
        [organizationId]: []
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Initialize defaults for pending selectors
  useEffect(() => {
    if (organizations?.length && (pendingOrg === "all" || !pendingOrg)) {
      // Set to "Global" if available, otherwise first organization
      const globalOrg = organizations.find(org => org.type === "global");
      setPendingOrg(globalOrg ? "Global" : organizations[0].id);
    }
  }, [organizations]);

  useEffect(() => {
    if (categories?.length && (pendingCat === "all" || !pendingCat)) {
      setPendingCat("All");
    }
  }, [categories]);



  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const isValidImage = file.type.startsWith('image/');
      const isValidVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      
      if (!isValidImage && !isValidVideo) {
        toast({
          title: "Invalid file type",
          description: "Please select only image or video files.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: "File size must be less than 100MB.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(validFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleUpload = async () => {
    if (!formData.title.trim() || selectedFiles.length === 0 || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please provide title, category, and select at least one file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Upload each selected file to backend (backend expects single file per request)
      const uploaded = [];
      for (const file of selectedFiles) {
        const response = await assetService.createAsset({
          title: formData.title,
          description: formData.description || "",
          category_id: formData.category,
          file
        });

        const created = response?.data || response; // support either shape

        const resource = {
          id: created?.id || created?._id || Date.now(),
          title: created?.title || formData.title,
          description: created?.description ?? formData.description ?? "",
          category: created?.category_id || formData.category,
          organization: created?.organization_id || "Global", // Default to Global since backend doesn't require org_id
          visibility: "global", // Default to global since backend doesn't require org_id
          fileName: created?.fileName || created?.filename || file.name,
          fileType: (created?.mimetype || file.type || "").startsWith('image/') ? 'image' : 'video',
          fileSize: ((created?.filesize ?? file.size) / (1024 * 1024)).toFixed(2),
          uploadDate: created?.createdAt || new Date().toISOString(),
          url: created?.assetUrl || created?.asset_url || created?.url || created?.Location || created?.fileUrl || URL.createObjectURL(file),
          thumbnail: ((created?.mimetype || file.type || "").startsWith('image/')) ? (created?.assetUrl || created?.asset_url || created?.url || created?.Location || created?.fileUrl || URL.createObjectURL(file)) : null
        };
        uploaded.push(resource);
      }

      setResources(prev => [...uploaded, ...prev]);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        organization: ""
      });
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Upload successful",
        description: `${uploaded.length} resource(s) uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    try {
      await assetService.deleteAsset(resourceId);
    setResources(prev => prev.filter(resource => resource.id !== resourceId));
    setSelectedResources(prev => prev.filter(id => id !== resourceId));
    toast({
        title: "Asset deleted",
        description: "The asset has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete asset on server. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditAsset = (asset) => {
    setEditingAsset({ id: asset.id, title: asset.title, description: asset.description || "" });
    setShowEditAssetModal(true);
  };

  const handleSaveEditAsset = async (data) => {
    if (!editingAsset?.id) return;
    try {
      const res = await assetService.editAsset(editingAsset.id, { title: data.title, description: data.description || "" });
      const updated = res?.data || res;
      setResources(prev => prev.map(r => r.id === editingAsset.id ? { ...r, title: updated?.title ?? data.title, description: updated?.description ?? data.description } : r));
      toast({ title: "Asset updated", description: "Changes saved successfully." });
      setShowEditAssetModal(false);
      setEditingAsset(null);
    } catch (error) {
      console.error('Error updating asset:', error);
      toast({ title: "Update failed", description: "Could not update asset on server.", variant: "destructive" });
    }
  };

  // Global search function that searches across all assets in the database
  const handleGlobalSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a search term to search for assets.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSearchLoading(true);
      
      // Call backend API to search across all assets
      const response = await assetService.searchAssets(searchTerm);
      const searchResults = response?.data || [];
      
      // Normalize the search results
      const normalized = searchResults.map((item, idx) => ({
        id: item?.id || item?._id || idx,
        title: item?.title || "Untitled",
        description: item?.description || "",
        category: item?.category_id || "",
        organization: item?.organization_id || "",
        visibility: "global", // Search results are global
        fileName: item?.fileName || item?.filename || item?.name || "asset",
        fileType: (item?.mimetype || item?.type || "").startsWith('image/') ? 'image' : 'video',
        fileSize: ((item?.filesize ?? 0) / (1024 * 1024)).toFixed(2),
        uploadDate: item?.createdAt || new Date().toISOString(),
        url: item?.assetUrl || item?.asset_url || item?.url || item?.Location || item?.fileUrl || ""
      }));

      setResources(normalized);
      toast({ 
        title: "Search completed", 
        description: `Found ${normalized.length} asset(s) matching "${searchTerm}"` 
      });
    } catch (error) {
      console.error('Error searching assets:', error);
      toast({
        title: "Search failed",
        description: "Failed to search assets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedResources.length === 0) return;
    
    setResources(prev => prev.filter(resource => !selectedResources.includes(resource.id)));
    setSelectedResources([]);
    toast({
      title: "Bulk delete successful",
      description: `${selectedResources.length} resource(s) have been deleted.`,
    });
  };

  const handleSelectAll = () => {
    if (selectedResources.length === resources.length) {
      setSelectedResources([]);
    } else {
      setSelectedResources(resources.map(resource => resource.id));
    }
  };

  const handleResourceSelect = (resourceId) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  // Organization Management
  const handleCreateOrganization = async (orgData) => {
    try {
      const response = await organizationService.createOrganization({
      name: orgData.name,
        description: orgData.description || ""
      });

      const newOrg = {
        id: response.data.id || response.data._id,
        name: response.data.name,
        description: response.data.description,
      type: "organization"
    };

    setOrganizations(prev => [...prev, newOrg]);
    setShowOrganizationModal(false);
    toast({
        title: "Success",
        description: `Organization "${orgData.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Failed to create organization. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditOrganization = async (orgData) => {
    try {
      const response = await organizationService.editOrganization(editingOrganization.id, {
        name: orgData.name,
        description: orgData.description || ""
      });

    setOrganizations(prev => 
      prev.map(org => 
        org.id === editingOrganization.id 
            ? { 
                ...org, 
                name: response.data.name, 
                description: response.data.description 
              }
          : org
      )
    );
    setShowOrganizationModal(false);
    setEditingOrganization(null);
    toast({
        title: "Success",
        description: `Organization "${orgData.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrganization = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    if (!org) return;

    // Check if organization has resources
    const hasResources = resources.some(resource => resource.organization === orgId);
    
    if (hasResources) {
      toast({
        title: "Cannot delete organization",
        description: "This organization has resources associated with it. Please remove or reassign the resources first.",
        variant: "destructive",
      });
      return;
    }

    // Check if it's a global organization
    if (org.type === "global") {
      toast({
        title: "Cannot delete global organization",
        description: "Global organizations cannot be deleted as they are system-wide.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation modal
    setDeleteItem(org);
    setDeleteType("organization");
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteOrganization = async () => {
    if (!deleteItem || deleteType !== "organization") return;
    
    try {
      await organizationService.deleteOrganization(deleteItem.id);
    
    setOrganizations(prev => prev.filter(org => org.id !== deleteItem.id));
    
    // Clear form if the deleted organization was selected
    if (formData.organization === deleteItem.id) {
      setFormData(prev => ({ ...prev, organization: "" }));
    }
    
    toast({
        title: "Success",
        description: `Organization "${deleteItem.name}" has been deleted successfully.`,
    });
    
    setShowDeleteConfirmModal(false);
    setDeleteItem(null);
    setDeleteType(null);
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Failed to delete organization. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Category Management
  const handleCreateCategory = async (categoryData) => {
    try {
      // Validate input
      if (!categoryData || !categoryData.name || !categoryData.name.trim()) {
        toast({
          title: "Error",
          description: "Please provide a valid category name",
          variant: "destructive"
        });
        return;
      }

      // Use the organization from the upload form if available, otherwise use pendingOrg
      const organizationId = formData.organization || pendingOrg;
      
      if (!organizationId) {
        toast({
          title: "Error",
          description: "Please select an organization first",
          variant: "destructive"
        });
        return;
      }

      const response = await categoryService.createCategory({
        name: categoryData.name.trim(),
        organization_id: organizationId
      });

    const newCategory = {
        id: response.data.id || response.data._id,
        name: response.data.name || categoryData.name, // Fallback to the input name if response doesn't have it
        color: getCategoryColor(response.data.name || categoryData.name),
        organization_id: organizationId
    };
    
    // Update categories for the specific organization
    setCategories(prev => [...prev, newCategory]);
    setOrganizationCategories(prev => ({
      ...prev,
      [organizationId]: [...(prev[organizationId] || []), newCategory]
    }));
    
    setShowCategoryModal(false);
    toast({
        title: "Success",
        description: `Category "${categoryData.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditCategory = async (categoryData) => {
    try {
      const response = await categoryService.editCategory(editingCategory.id, {
        name: categoryData.name
      });

    const updatedCategory = {
      ...editingCategory,
      name: response.data.name || categoryData.name,
      color: getCategoryColor(response.data.name || categoryData.name)
    };
    
    setCategories(prev => 
      prev.map(cat => 
        cat.id === editingCategory.id ? updatedCategory : cat
      )
    );
    
    // Update organization-specific categories
    setOrganizationCategories(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(orgId => {
        updated[orgId] = updated[orgId].map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        );
      });
      return updated;
    });
    
    setShowCategoryModal(false);
    setEditingCategory(null);
    toast({
        title: "Success",
        description: `Category "${categoryData.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    // Check if category has resources
    const hasResources = resources.some(resource => resource.category === categoryId);
    
    if (hasResources) {
      toast({
        title: "Cannot delete category",
        description: "This category has resources associated with it. Please remove or reassign the resources first.",
        variant: "destructive",
      });
      return;
    }

    // Check if it's a default category (General)
    if (category.name.toLowerCase() === "general") {
      toast({
        title: "Cannot delete default category",
        description: "The 'General' category cannot be deleted as it's a default system category.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation modal
    setDeleteItem(category);
    setDeleteType("category");
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteItem || deleteType !== "category") return;
    
    try {
      await categoryService.deleteCategory(deleteItem.id);
    
    setCategories(prev => prev.filter(cat => cat.id !== deleteItem.id));
    
    // Update organization-specific categories
    setOrganizationCategories(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(orgId => {
        updated[orgId] = updated[orgId].filter(cat => cat.id !== deleteItem.id);
      });
      return updated;
    });
    
    // Clear form if the deleted category was selected
    if (formData.category === deleteItem.id) {
      setFormData(prev => ({ ...prev, category: "" }));
    }
    
    toast({
        title: "Success",
        description: `Category "${deleteItem.name}" has been deleted successfully.`,
    });
    
    setShowDeleteConfirmModal(false);
    setDeleteItem(null);
    setDeleteType(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (fileType) => {
    return fileType === 'image' ? <FileImage className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (categoryName) => {
    // Handle undefined or null categoryName
    if (!categoryName || typeof categoryName !== 'string') {
      return "bg-gray-100 text-gray-800"; // Default color
    }
    
    const colors = {
      general: "bg-gray-100 text-gray-800",
      course: "bg-blue-100 text-blue-800",
      lesson: "bg-green-100 text-green-800",
      reference: "bg-purple-100 text-purple-800",
      template: "bg-orange-100 text-orange-800"
    };
    
    const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '');
    return colors[categoryKey] || colors.general;
  };

  const getOrganizationName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : "Unknown Organization";
  };

  const getVisibilityIcon = (visibility) => {
    return visibility === "global" ? <Globe className="w-4 h-4" /> : <Users className="w-4 h-4" />;
  };

  // Since we're now doing server-side search, we don't need client-side filtering
  // The resources state will contain the search results directly
  const filteredResources = resources;

  return (
    <div className="space-y-8 bg-slate-50 min-h-screen p-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl border border-indigo-200">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <p className="text-gray-700 font-medium">Loading organizations and categories...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">Failed to load data</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-100 border-red-300"
            >
              Retry
            </Button>
          </div>
        </div>
      )}
      
      {/* Management Section */}
      <Card className="border-0 shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white">
          <div className="flex items-center justify-between">
            <div>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            Manage Organizations & Categories
          </CardTitle>
          <CardDescription className="text-indigo-100">
            Create and edit organizations and categories for better resource organization
          </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-500"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Organizations Management */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Organizations & Categories</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingOrganization(null);
                    setShowOrganizationModal(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-lg transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                  Add Organization
                </Button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {loading ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="text-sm text-gray-500">Loading organizations...</div>
                  </div>
                ) : organizations.length === 0 ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="text-sm text-gray-500">No organizations found</div>
                  </div>
                ) : (
                  organizations.map(org => {
                    const orgCategories = organizationCategories[org.id] || [];
                    return (
                      <div key={org.id} className="p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-lg flex items-center justify-center shadow">
                                <Building className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-base font-semibold text-gray-900 truncate" title={org.name}>{org.name}</span>
                              {org.type === "global" && (
                                <Badge className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1">Global</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 ml-11" title={org.description || "No description"}>
                              {org.description || "No description added"}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingOrganization(org);
                                setShowOrganizationModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 w-10 h-10 rounded-full"
                              title="Edit Organization"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {org.type !== "global" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOrganization(org.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 w-10 h-10 rounded-full"
                                title="Delete Organization"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Categories for this organization */}
                        <div className="ml-11 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              Categories ({orgCategories.length})
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCategory(null);
                                setShowCategoryModal(true);
                              }}
                              className="flex items-center gap-1 bg-indigo-500 text-white border-0 hover:bg-indigo-600 shadow-sm hover:shadow-md px-3 py-1 text-xs"
                              disabled={loading}
                            >
                              <Plus className="w-3 h-3" />
                              Add Category
                            </Button>
                          </div>
                          
                          {orgCategories.length === 0 ? (
                            <div className="text-xs text-gray-500 italic">No categories yet</div>
                          ) : (
                            <div className="space-y-2">
                              {orgCategories.map(category => (
                                <div
                                  key={category.id}
                                  className="p-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <div className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-sky-500 rounded flex items-center justify-center">
                                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                      </div>
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${category.color} truncate`}>{category.name}</span>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingCategory(category);
                                          setShowCategoryModal(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 w-6 h-6 rounded p-0"
                                        title="Edit Category"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      {category.name.toLowerCase() !== "general" && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteCategory(category.id)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 w-6 h-6 rounded p-0"
                                          title="Delete Category"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="border-0 shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            Upload Assets
          </CardTitle>
          <CardDescription className="text-indigo-100">
             Upload images and videos with titles, descriptions, and organization settings. Resources assigned to "Global Resources" will be visible to all users. Supported formats: JPG, PNG, GIF, MP4, MOV, AVI (Max 100MB)
           </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Title *
              </label>
              <Input
                placeholder="Enter asset title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/30 rounded-xl transition-shadow duration-200 focus:shadow-lg"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Organization *
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow duration-200 focus:shadow-md"
                  value={formData.organization}
                  onChange={(e) => {
                    const newOrgId = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      organization: newOrgId,
                      category: "" // Reset category when organization changes
                    }));
                    
                    // Update categories for the selected organization
                    if (newOrgId && newOrgId !== "") {
                      const orgCategories = organizationCategories[newOrgId] || [];
                      setCategories(orgCategories);
                    } else {
                      setCategories([]);
                    }
                  }}
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Loading..." : "Select Organization"}
                  </option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingOrganization(null);
                    setShowOrganizationModal(true);
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-sm hover:shadow-md"
                  title="Add New Organization"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (formData.organization) {
                      const organization = organizations.find(org => org.id === formData.organization);
                      if (organization) {
                        setEditingOrganization(organization);
                        setShowOrganizationModal(true);
                      }
                    }
                  }}
                  className="px-4 py-3 bg-slate-600 text-white border-0 hover:bg-slate-700 shadow-sm hover:shadow-md"
                  title="Edit Selected Organization"
                  disabled={!formData.organization || loading}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category dropdown - only show when organization is selected */}
          {formData.organization && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Category *
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow duration-200 focus:shadow-md"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Loading..." : "Select Category"}
                  </option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCategory(null);
                    setShowCategoryModal(true);
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-sm hover:shadow-md"
                  title="Add New Category"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (formData.category) {
                      const category = categories.find(cat => cat.id === formData.category);
                      if (category) {
                        setEditingCategory(category);
                        setShowCategoryModal(true);
                      }
                    }
                  }}
                  className="px-4 py-3 bg-slate-600 text-white border-0 hover:bg-slate-700 shadow-sm hover:shadow-md"
                  title="Edit Selected Category"
                  disabled={!formData.category || loading}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}


          
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Description
            </label>
            <Textarea
              placeholder="Enter asset description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/30 rounded-xl transition-shadow duration-200 focus:shadow-md"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Select Files *
            </label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white focus-within:ring-2 focus-within:ring-indigo-200"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-4 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-lg px-6 py-3 rounded-xl transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose Files
              </Button>
              <p className="text-base text-gray-600 font-medium">
                Drag and drop files here, or click to browse
              </p>
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Files:</p>
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        {file.type.startsWith('image/') ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                        <span>{file.name}</span>
                        <span className="text-gray-500">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

                      <Button 
              onClick={handleUpload} 
              disabled={uploading || loading || selectedFiles.length === 0 || !formData.title.trim() || !formData.organization || !formData.category}
              className="w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-xl py-4 rounded-xl text-lg font-semibold transition-transform duration-200 hover:-translate-y-0.5"
            >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Uploading...
              </div>
            ) : (
              "Upload Assets"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resources List */}
      <Card className="border-0 shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              Uploaded Assets ({filteredResources.length})
          </CardTitle>
            {/* Global Search Bar */}
            <div className="flex items-center gap-3">
              <div className="w-72 relative">
                <Input
                  placeholder="Search all assets globally..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleGlobalSearch();
                    }
                  }}
                  className="text-sm pr-10 bg-white/90 border-white/30 focus:bg-white focus:border-white rounded-xl"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setResources([]);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGlobalSearch}
                disabled={searchLoading || !searchTerm.trim()}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-500"
              >
                {searchLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                Search
              </Button>
            </div>
          </div>
          <CardDescription className="text-indigo-100">
            Manage and organize your uploaded assets
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {/* Select Organization/Category and apply */}
          <div className="mb-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Select Organization
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={pendingOrg}
                  onChange={async (e) => {
                    const newOrgValue = e.target.value;
                    setPendingOrg(newOrgValue);
                    setPendingCat("All"); // Reset category selection to "All"
                    
                    // Update categories for the selected organization
                    if (newOrgValue && newOrgValue !== "Global") {
                      const orgCategories = organizationCategories[newOrgValue] || [];
                      setCategories(orgCategories);
                    } else if (newOrgValue === "Global") {
                      // For Global, show all categories from all organizations
                      const allCategories = Object.values(organizationCategories).flat();
                      setCategories(allCategories);
                    } else {
                      setCategories([]);
                    }
                  }}
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Loading organizations..." : "Select Organization"}
                  </option>
                  <option value="Global">Global</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  Select Category
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  value={pendingCat}
                  onChange={(e) => setPendingCat(e.target.value)}
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Loading categories..." : "Select Category"}
                  </option>
                  <option value="All">All</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-lg py-3 rounded-xl font-semibold transition-transform duration-200 hover:-translate-y-0.5"
                  onClick={async () => {
                    try {
                      setAssetsLoading(true);
                      
                      // Prepare payload based on selections
                      const payload = {
                        organization_id: pendingOrg === "Global" ? "Global" : pendingOrg,
                        category_id: pendingCat === "All" ? "All" : pendingCat
                      };
                      
                      const res = await assetService.getAssets(payload);
                      const list = res?.data || [];
                      const normalized = list.map((item, idx) => ({
                        id: item?.id || item?._id || idx,
                        title: item?.title || "Untitled",
                        description: item?.description || "",
                        category: item?.category_id || pendingCat,
                        organization: item?.organization_id || pendingOrg,
                        visibility: pendingOrg === "Global" ? "global" : "organization",
                        fileName: item?.fileName || item?.filename || item?.name || "asset",
                        fileType: (item?.mimetype || item?.type || "").startsWith('image/') ? 'image' : 'video',
                        fileSize: ((item?.filesize ?? 0) / (1024 * 1024)).toFixed(2),
                        uploadDate: item?.createdAt || new Date().toISOString(),
                        url: item?.assetUrl || item?.asset_url || item?.url || item?.Location || item?.fileUrl || ""
                      }));
                      setResources(normalized);
                      setFilterOrganization(pendingOrg);
                      setFilterCategory(pendingCat);
                      toast({ title: "Assets loaded", description: `${normalized.length} asset(s) fetched.` });
                    } catch (e) {
                      toast({ title: "Failed to load assets", description: "Check organization/category selection and try again.", variant: "destructive" });
                    } finally {
                      setAssetsLoading(false);
                    }
                  }}
                  disabled={loading || assetsLoading}
                >
                  {assetsLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Loading...
                    </div>
                  ) : (
                    "Show Assets"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Filters removed per request */}
 
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-400" />
                </div>
              <p className="text-lg font-semibold mb-2">No assets found.</p>
              <p className="text-sm">Try changing organization/category or search text.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredResources.map((resource) => {
                const organization = organizations.find(org => org.id === resource.organization);
                const category = categories.find(cat => cat.id === resource.category);
                return (
                  <div key={resource.id} className="flex flex-col rounded-3xl p-6 shadow-xl border border-slate-100 bg-white hover:bg-slate-50 transition-all duration-300 ring-1 ring-slate-100 hover:ring-indigo-200 transform hover:-translate-y-2">
                    <div className="flex-1 space-y-2">
                      <div className="text-base md:text-lg font-semibold text-gray-900" title={resource.title}>{resource.title || 'Untitled asset'}</div>
                      <div className="flex items-start gap-2 text-xs text-gray-700 min-w-0">
                        {getFileIcon(resource.fileType)}
                        <a href={resource.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-words whitespace-pre-wrap w-full" title={resource.url}>
                          {resource.url}
                        </a>
                      </div>
                      {resource.description ? (
                        <p className="text-xs text-gray-600 line-clamp-2">{resource.description}</p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {category ? (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] ${category.color}`}>{category.name}</span>
                        ) : null}
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-800" title={organization?.name || 'Unknown Org'}>
                          <Building className="w-3 h-3 mr-1" />
                          {organization?.name || 'Unknown Org'}
                        </div>
                        {resource.fileSize ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-purple-100 text-purple-800">{resource.fileSize} MB</span>
                        ) : null}
                      </div>
                      </div>
                    <div className="flex items-center justify-end gap-3 pt-6">
                        <Button
                          variant="outline"
                        size="icon"
                        className="hover:bg-indigo-50 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
                        onClick={() => { navigator.clipboard.writeText(resource.url); toast({ title: 'Copied', description: 'Link copied to clipboard' }); }}
                        title="Copy link"
                      >
                        <Copy className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="outline"
                        size="icon"
                        className="hover:bg-slate-50 w-12 h-12 rounded-full bg-slate-600 text-white border-0 hover:bg-slate-700 shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
                        onClick={() => handleOpenEditAsset(resource)}
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                        </Button>
                        <Button
                        variant="destructive"
                        size="icon"
                        className="w-12 h-12 rounded-full bg-red-600 text-white border-0 hover:bg-red-700 shadow-lg"
                          onClick={() => handleDelete(resource.id)}
                        title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Modal */}
      {showOrganizationModal && (
        <OrganizationModal
          organization={editingOrganization}
          onSave={editingOrganization ? handleEditOrganization : handleCreateOrganization}
          onClose={() => {
            setShowOrganizationModal(false);
            setEditingOrganization(null);
          }}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onSave={editingCategory ? handleEditCategory : handleCreateCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <DeleteConfirmModal
          item={deleteItem}
          type={deleteType}
          onConfirm={deleteType === "organization" ? confirmDeleteOrganization : confirmDeleteCategory}
          onClose={() => {
            setShowDeleteConfirmModal(false);
            setDeleteItem(null);
            setDeleteType(null);
          }}
        />
      )}

      {/* Edit Asset Modal */}
      {showEditAssetModal && (
        <EditAssetModal
          asset={editingAsset}
          onSave={handleSaveEditAsset}
          onClose={() => { setShowEditAssetModal(false); setEditingAsset(null); }}
        />
      )}
    </div>
  );
};

// Organization Modal Component
const OrganizationModal = ({ organization, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    description: organization?.description || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {organization ? "Edit Organization" : "Create New Organization"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter organization name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter organization description (optional)"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {organization ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ category, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: category?.name || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {category ? "Edit Category" : "Create New Category"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="Enter category name"
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {category ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ item, type, onConfirm, onClose }) => {
  if (!item) return null;

  const getTypeInfo = () => {
    if (type === "organization") {
      return {
        title: "Delete Organization",
        message: `Are you sure you want to delete the organization "${item.name}"?`,
        warning: "This action cannot be undone."
      };
    } else if (type === "category") {
      return {
        title: "Delete Category",
        message: `Are you sure you want to delete the category "${item.name}"?`,
        warning: "This action cannot be undone."
      };
    }
    return { title: "Delete Item", message: "Are you sure?", warning: "" };
  };

  const typeInfo = getTypeInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {typeInfo.title}
          </h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">{typeInfo.message}</p>
          {typeInfo.warning && (
            <p className="text-sm text-red-600 font-medium">{typeInfo.warning}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// Edit Asset Modal Component
const EditAssetModal = ({ asset, onSave, onClose }) => {
  const [local, setLocal] = useState({ title: asset?.title || "", description: asset?.description || "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!local.title.trim()) return;
    onSave(local);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Edit Asset</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <Input
              value={local.title}
              onChange={(e) => setLocal(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter asset title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              value={local.description}
              onChange={(e) => setLocal(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Resources;
