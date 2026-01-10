import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  organizationService,
  categoryService,
  assetService,
} from "@/services/assetsService";

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
  const [pendingFileType, setPendingFileType] = useState("all");

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
  const [categoryOrganizationId, setCategoryOrganizationId] = useState(null);
  const [collapsedOrganizations, setCollapsedOrganizations] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    organization: "",
    file_type: "",
  });

  // Organizations and categories from backend
  const [organizations, setOrganizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [organizationCategories, setOrganizationCategories] = useState({}); // New: categories organized by organization
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toggle organization collapse state
  const toggleOrganizationCollapse = (orgId) => {
    setCollapsedOrganizations((prev) => ({
      ...prev,
      [orgId]: !prev[orgId],
    }));
  };

  // Refresh data after operations to ensure consistency
  const refreshDataAfterOperation = async () => {
    try {
      await fetchData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Fetch organizations and categories from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch organizations
      const orgsResponse = await organizationService.getOrganizations();

      // Transform backend data to match frontend structure
      const transformedOrgs =
        orgsResponse.data?.map((org) => ({
          id: org.id || org._id,
          name: org.name,
          description: org.description,
          type: org.name === "Global" ? "global" : "organization",
        })) || [];

      setOrganizations(transformedOrgs);

      // Fetch categories for all organizations
      const categoriesByOrg = {};
      for (const org of transformedOrgs) {
        try {
          const catsResponse = await categoryService.getCategories(org.id);
          const transformedCats =
            catsResponse.data?.map((cat) => ({
              id: cat.id || cat._id,
              name: cat.name,
              color: getCategoryColor(cat.name),
              organization_id: org.id,
            })) || [];
          categoriesByOrg[org.id] = transformedCats;
        } catch (error) {
          console.error(
            `Error fetching categories for organization ${org.id}:`,
            error,
          );
          categoriesByOrg[org.id] = [];
        }
      }

      setOrganizationCategories(categoriesByOrg);

      // Set initial categories (for Global organization or first organization)
      const globalOrg = transformedOrgs.find((org) => org.type === "global");
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
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to fetch data");
      toast({
        title: "Error",
        description: "Failed to fetch organizations and categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch categories for a specific organization
  const fetchCategoriesForOrganization = async (organizationId) => {
    try {
      const catsResponse = await categoryService.getCategories(organizationId);
      const transformedCats =
        catsResponse.data?.map((cat) => ({
          id: cat.id || cat._id,
          name: cat.name,
          color: getCategoryColor(cat.name),
          organization_id: organizationId,
        })) || [];

      // Update both the general categories and the organization-specific categories
      setCategories(transformedCats);
      setOrganizationCategories((prev) => ({
        ...prev,
        [organizationId]: transformedCats,
      }));
    } catch (error) {
      console.error("Error fetching categories for organization:", error);
      setCategories([]);
      setOrganizationCategories((prev) => ({
        ...prev,
        [organizationId]: [],
      }));
    }
  };

  // Helper to find organizationId for a given category id from local state
  const getOrganizationIdForCategory = (categoryId) => {
    for (const orgId of Object.keys(organizationCategories)) {
      const found = (organizationCategories[orgId] || []).some(
        (c) => c.id === categoryId,
      );
      if (found) return orgId;
    }
    return null;
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Initialize defaults for pending selectors
  useEffect(() => {
    if (organizations?.length && (pendingOrg === "all" || !pendingOrg)) {
      // Set to "Global" if available, otherwise first organization
      const globalOrg = organizations.find((org) => org.type === "global");
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
    // Backend middleware expects: field name 'assetfile', max size 1GB
    const validFiles = files.filter((file) => {
      const isValidImage = file.type.startsWith("image/");
      const isValidVideo = file.type.startsWith("video/");
      const isValidAudio = file.type.startsWith("audio/");
      const isValidText =
        file.type.startsWith("text/") ||
        file.type === "application/json" ||
        file.type === "application/xml";
      const isValidPdf = file.type === "application/pdf";
      const isValidSize = file.size <= 1024 * 1024 * 1024; // 1GB limit (matching backend middleware)

      if (
        !isValidImage &&
        !isValidVideo &&
        !isValidAudio &&
        !isValidText &&
        !isValidPdf
      ) {
        toast({
          title: "Invalid file type",
          description:
            "Please select only image, video, audio, text, or PDF files.",
          variant: "destructive",
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: "File too large",
          description: "File size must be less than 1GB.",
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
    e.currentTarget.classList.add("border-blue-400", "bg-blue-50");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleUpload = async () => {
    if (
      !formData.title.trim() ||
      selectedFiles.length === 0 ||
      !formData.category ||
      !formData.file_type
    ) {
      toast({
        title: "Missing information",
        description:
          "Please provide title, category, file type, and select at least one file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Resolve category id robustly. In some cases UI may hold the name instead of id.
      const resolvedCategoryId = (() => {
        // If it exactly matches a known id, use it
        const byId = categories.find((cat) => cat.id === formData.category);
        if (byId) return byId.id;
        // Otherwise try to match by name (case-insensitive)
        const byName = categories.find(
          (cat) =>
            String(cat.name).toLowerCase() ===
            String(formData.category).toLowerCase(),
        );
        return byName ? byName.id : formData.category; // fallback to whatever is present
      })();

      if (!resolvedCategoryId) {
        toast({
          title: "Invalid category",
          description: "Please select a valid category before uploading.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      // Upload each selected file to backend (backend expects single file per request)
      // Backend middleware: field name 'assetfile', max size 1GB, FormData handling
      const uploaded = [];
      for (const file of selectedFiles) {
        const response = await assetService.createAsset({
          title: formData.title,
          description: formData.description || "",
          category_id: resolvedCategoryId,
          file_type: formData.file_type,
          file,
        });

        const created = response?.data || response; // support either shape

        // Determine file type from backend file_type field or fallback to mime type
        const getFileTypeFromBackend = (backendFileType, mimeType) => {
          // If backend provides file_type, use it
          if (backendFileType) {
            return backendFileType.toLowerCase();
          }

          // Fallback to mime type detection
          if (mimeType.startsWith("image/")) return "image";
          if (mimeType.startsWith("video/")) return "video";
          if (mimeType.startsWith("audio/")) return "audio";
          if (mimeType === "application/pdf") return "pdf";
          if (
            mimeType.startsWith("text/") ||
            mimeType === "application/json" ||
            mimeType === "application/xml"
          )
            return "text";
          return "text"; // default
        };

        const resource = {
          id: created?.id || created?._id || Date.now(),
          title: created?.title || formData.title,
          description: created?.description ?? formData.description ?? "",
          category: created?.category_id || formData.category,
          organization: created?.organization_id || "Global", // Default to Global since backend doesn't require org_id
          visibility: "global", // Default to global since backend doesn't require org_id
          fileName: created?.fileName || created?.filename || file.name,
          fileType: getFileTypeFromBackend(
            created?.file_type,
            created?.mimetype || file.type || "",
          ),
          fileSize: ((created?.filesize ?? file.size) / (1024 * 1024)).toFixed(
            2,
          ),
          uploadDate: created?.createdAt || new Date().toISOString(),
          url:
            created?.assetUrl ||
            created?.asset_url ||
            created?.url ||
            created?.Location ||
            created?.fileUrl ||
            URL.createObjectURL(file),
          thumbnail: (created?.mimetype || file.type || "").startsWith("image/")
            ? created?.assetUrl ||
              created?.asset_url ||
              created?.url ||
              created?.Location ||
              created?.fileUrl ||
              URL.createObjectURL(file)
            : null,
        };
        uploaded.push(resource);
      }

      setResources((prev) => [...uploaded, ...prev]);

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        organization: "",
        file_type: "",
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
      setResources((prev) =>
        prev.filter((resource) => resource.id !== resourceId),
      );
      setSelectedResources((prev) => prev.filter((id) => id !== resourceId));
      toast({
        title: "Asset deleted",
        description: "The asset has been removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete asset on server. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditAsset = (asset) => {
    setEditingAsset({
      id: asset.id,
      title: asset.title,
      description: asset.description || "",
    });
    setShowEditAssetModal(true);
  };

  const handleSaveEditAsset = async (data) => {
    if (!editingAsset?.id) return;
    try {
      const res = await assetService.editAsset(editingAsset.id, {
        title: data.title,
        description: data.description || "",
      });
      const updated = res?.data || res;
      setResources((prev) =>
        prev.map((r) =>
          r.id === editingAsset.id
            ? {
                ...r,
                title: updated?.title ?? data.title,
                description: updated?.description ?? data.description,
              }
            : r,
        ),
      );
      toast({
        title: "Asset updated",
        description: "Changes saved successfully.",
      });
      setShowEditAssetModal(false);
      setEditingAsset(null);
    } catch (error) {
      console.error("Error updating asset:", error);
      toast({
        title: "Update failed",
        description: "Could not update asset on server.",
        variant: "destructive",
      });
    }
  };

  // Global search function that searches across all assets in the database
  const handleGlobalSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a search term to search for assets.",
        variant: "destructive",
      });
      return;
    }

    if (searchTerm.trim().length < 2) {
      toast({
        title: "Search term too short",
        description: "Please enter at least 2 characters to search for assets.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSearchLoading(true);

      // Call backend API to search across all assets
      const response = await assetService.searchAssets(searchTerm);
      const searchResults = response?.data || [];

      // Normalize the search results
      const normalized = searchResults.map((item, idx) => {
        // Determine file type from backend file_type field or fallback to mime type
        const getFileTypeFromBackend = (backendFileType, mimeType) => {
          // If backend provides file_type, use it
          if (backendFileType) {
            return backendFileType.toLowerCase();
          }

          // Fallback to mime type detection
          if (mimeType.startsWith("image/")) return "image";
          if (mimeType.startsWith("video/")) return "video";
          if (mimeType.startsWith("audio/")) return "audio";
          if (mimeType === "application/pdf") return "pdf";
          if (
            mimeType.startsWith("text/") ||
            mimeType === "application/json" ||
            mimeType === "application/xml"
          )
            return "text";
          return "text"; // default
        };

        return {
          id: item?.id || item?._id || idx,
          title: item?.title || "Untitled",
          description: item?.description || "",
          category: item?.category_id || "",
          organization: item?.organization_id || "",
          visibility: "global", // Search results are global
          fileName: item?.fileName || item?.filename || item?.name || "asset",
          fileType: getFileTypeFromBackend(
            item?.file_type,
            item?.mimetype || item?.type || "",
          ),
          fileSize: ((item?.filesize ?? 0) / (1024 * 1024)).toFixed(2),
          uploadDate: item?.createdAt || new Date().toISOString(),
          url:
            item?.assetUrl ||
            item?.asset_url ||
            item?.url ||
            item?.Location ||
            item?.fileUrl ||
            "",
        };
      });

      setResources(normalized);
      if (normalized.length === 0) {
        toast({
          title: "No results found",
          description: `No assets found matching "${searchTerm}". Try a different search term.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${normalized.length} asset(s) matching "${searchTerm}"`,
        });
      }
    } catch (error) {
      console.error("Error searching assets:", error);
      toast({
        title: "Search failed",
        description: "Failed to search assets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedResources.length === 0) return;

    setResources((prev) =>
      prev.filter((resource) => !selectedResources.includes(resource.id)),
    );
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
      setSelectedResources(resources.map((resource) => resource.id));
    }
  };

  const handleResourceSelect = (resourceId) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId],
    );
  };

  // Organization Management
  const handleCreateOrganization = async (orgData) => {
    try {
      const response = await organizationService.createOrganization({
        name: orgData.name,
        description: orgData.description || "",
      });

      const newOrg = {
        id: response.data.id || response.data._id,
        name: response.data.name || orgData.name,
        description: response.data.description || orgData.description || "",
        type: "organization",
        // Ensure all backend fields are included
        createdAt: response.data.createdAt || new Date().toISOString(),
        updatedAt: response.data.updatedAt || new Date().toISOString(),
      };

      // Update organizations list
      setOrganizations((prev) => [...prev, newOrg]);

      // Initialize empty categories array for the new organization
      setOrganizationCategories((prev) => ({
        ...prev,
        [newOrg.id]: [],
      }));

      // Update categories if we're currently showing Global or if this is the first org
      if (pendingOrg === "Global" || organizations.length === 0) {
        setCategories((prev) => [...prev]);
      }

      setShowOrganizationModal(false);
      toast({
        title: "Success",
        description: `Organization "${orgData.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error("Error creating organization:", error);
      toast({
        title: "Error",
        description: "Failed to create organization. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditOrganization = async (orgData) => {
    try {
      const response = await organizationService.editOrganization(
        editingOrganization.id,
        {
          name: orgData.name,
          description: orgData.description || "",
        },
      );

      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === editingOrganization.id
            ? {
                ...org,
                name: response.data.name,
                description: response.data.description,
              }
            : org,
        ),
      );

      // Update organization categories if the name changed (in case it affects category display)
      if (editingOrganization.name !== response.data.name) {
        setOrganizationCategories((prev) => {
          const updated = { ...prev };
          if (updated[editingOrganization.id]) {
            // Update category colors if organization name affects them
            updated[editingOrganization.id] = updated[
              editingOrganization.id
            ].map((cat) => ({
              ...cat,
              color: getCategoryColor(cat.name),
            }));
          }
          return updated;
        });
      }

      setShowOrganizationModal(false);
      setEditingOrganization(null);
      toast({
        title: "Success",
        description: `Organization "${orgData.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating organization:", error);
      toast({
        title: "Error",
        description: "Failed to update organization. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrganization = (orgId) => {
    const org = organizations.find((o) => o.id === orgId);
    if (!org) return;

    // Check if it's a global organization
    if (org.type === "global") {
      toast({
        title: "Cannot delete global organization",
        description:
          "Global organizations cannot be deleted as they are system-wide.",
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

      setOrganizations((prev) =>
        prev.filter((org) => org.id !== deleteItem.id),
      );

      // Remove organization categories from state
      setOrganizationCategories((prev) => {
        const updated = { ...prev };
        delete updated[deleteItem.id];
        return updated;
      });

      // Clear form if the deleted organization was selected
      if (formData.organization === deleteItem.id) {
        setFormData((prev) => ({ ...prev, organization: "" }));
      }

      // Update pending organization if it was deleted
      if (pendingOrg === deleteItem.id) {
        setPendingOrg("all");
        setPendingCat("all");
        setCategories([]);
      }

      toast({
        title: "Success",
        description: `Organization "${deleteItem.name}" has been deleted successfully.`,
      });

      setShowDeleteConfirmModal(false);
      setDeleteItem(null);
      setDeleteType(null);
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast({
        title: "Error",
        description: "Failed to delete organization. Please try again.",
        variant: "destructive",
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
          variant: "destructive",
        });
        return;
      }

      // Use the organization ID from the category creation context
      const organizationId = categoryOrganizationId;

      if (!organizationId) {
        toast({
          title: "Error",
          description: "Please select an organization first",
          variant: "destructive",
        });
        return;
      }

      const response = await categoryService.createCategory({
        name: categoryData.name.trim(),
        organization_id: organizationId,
      });

      const newCategory = {
        id: response.data.id || response.data._id,
        name: response.data.name || categoryData.name.trim(),
        color: getCategoryColor(response.data.name || categoryData.name.trim()),
        organization_id: organizationId,
        // Ensure all backend fields are included
        createdAt: response.data.createdAt || new Date().toISOString(),
        updatedAt: response.data.updatedAt || new Date().toISOString(),
      };

      // Re-fetch categories from backend to ensure consistency
      await fetchCategoriesForOrganization(organizationId);

      setShowCategoryModal(false);
      setCategoryOrganizationId(null);
      toast({
        title: "Success",
        description: `Category "${categoryData.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error("Error creating category:", error);
      console.error("Organization ID:", organizationId);
      console.error("Category data:", categoryData);

      let errorMessage = "Failed to create category. Please try again.";

      if (error.response?.status === 500) {
        errorMessage =
          "Server error occurred. The organization might not exist in the database.";
        console.error("Server response:", error.response.data);
        // Refresh data to sync with backend
        setTimeout(() => refreshDataAfterOperation(), 1000);
      } else if (error.response?.status === 404) {
        errorMessage = "Organization not found. Please refresh the page.";
        setTimeout(() => refreshDataAfterOperation(), 1000);
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async (categoryData) => {
    try {
      // Ensure we have a valid category to edit
      if (!editingCategory || !editingCategory.id) {
        toast({
          title: "Error",
          description: "No category selected for editing.",
          variant: "destructive",
        });
        return;
      }

      const response = await categoryService.editCategory(editingCategory.id, {
        name: categoryData.name.trim(),
      });

      const updatedCategory = {
        ...editingCategory,
        name: response.data.name || categoryData.name.trim(),
        color: getCategoryColor(response.data.name || categoryData.name.trim()),
        updatedAt: response.data.updatedAt || new Date().toISOString(),
      };

      // Persist by re-fetching from backend for the category's organization
      const orgIdForEdited =
        getOrganizationIdForCategory(editingCategory.id) ||
        categoryOrganizationId ||
        formData.organization ||
        pendingOrg;
      if (orgIdForEdited && orgIdForEdited !== "Global") {
        await fetchCategoriesForOrganization(orgIdForEdited);
      }

      setShowCategoryModal(false);
      setEditingCategory(null);
      toast({
        title: "Success",
        description: `Category "${categoryData.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      console.error("Category being edited:", editingCategory);
      console.error("Category data:", categoryData);

      let errorMessage = "Failed to update category. Please try again.";

      if (error.response?.status === 500) {
        errorMessage =
          "Server error occurred. The category might not exist in the database.";
        console.error("Server response:", error.response.data);
      } else if (error.response?.status === 404) {
        errorMessage = "Category not found. It might have been deleted.";
        // Refresh data to sync with backend
        setTimeout(() => refreshDataAfterOperation(), 1000);
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = (categoryId) => {
    // Find category across all organizations if not in the currently selected categories
    let category = categories.find((cat) => cat.id === categoryId);
    if (!category) {
      for (const orgId of Object.keys(organizationCategories)) {
        const found = (organizationCategories[orgId] || []).find(
          (cat) => cat.id === categoryId,
        );
        if (found) {
          category = found;
          break;
        }
      }
    }
    if (!category) return;

    // Check if it's a default category (General)
    if (category.name.toLowerCase() === "general") {
      toast({
        title: "Cannot delete default category",
        description:
          "The 'General' category cannot be deleted as it's a default system category.",
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

      // Re-fetch categories for the affected organization to keep UI in sync
      const orgIdForDeleted =
        getOrganizationIdForCategory(deleteItem.id) ||
        categoryOrganizationId ||
        formData.organization ||
        pendingOrg;
      if (orgIdForDeleted && orgIdForDeleted !== "Global") {
        await fetchCategoriesForOrganization(orgIdForDeleted);
      }

      // Clear form if the deleted category was selected
      if (formData.category === deleteItem.id) {
        setFormData((prev) => ({ ...prev, category: "" }));
      }

      // Update pending category if it was deleted
      if (pendingCat === deleteItem.id) {
        setPendingCat("all");
      }

      toast({
        title: "Success",
        description: `Category "${deleteItem.name}" has been deleted successfully.`,
      });

      setShowDeleteConfirmModal(false);
      setDeleteItem(null);
      setDeleteType(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "image":
        return <FileImage className="w-5 h-5" />;
      case "video":
        return <FileVideo className="w-5 h-5" />;
      case "audio":
        return <FileText className="w-5 h-5" />;
      case "text":
        return <FileText className="w-5 h-5" />;
      case "pdf":
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (categoryName) => {
    // Handle undefined or null categoryName
    if (!categoryName || typeof categoryName !== "string") {
      return "bg-gray-100 text-gray-800"; // Default color
    }

    const colors = {
      general: "bg-gray-100 text-gray-800",
      course: "bg-blue-100 text-blue-800",
      lesson: "bg-green-100 text-green-800",
      reference: "bg-purple-100 text-purple-800",
      template: "bg-orange-100 text-orange-800",
    };

    const categoryKey = categoryName.toLowerCase().replace(/\s+/g, "");
    return colors[categoryKey] || colors.general;
  };

  const getOrganizationName = (orgId) => {
    const org = organizations.find((o) => o.id === orgId);
    return org ? org.name : "Unknown Organization";
  };

  const getVisibilityIcon = (visibility) => {
    return visibility === "global" ? (
      <Globe className="w-4 h-4" />
    ) : (
      <Users className="w-4 h-4" />
    );
  };

  // Filter resources based on file type
  const getFilteredResources = (resourcesToFilter) => {
    let filtered = resourcesToFilter;

    // Apply file type filter
    if (pendingFileType !== "all") {
      filtered = filtered.filter((resource) => {
        const resourceFileType = resource.fileType?.toLowerCase();
        const selectedFileType = pendingFileType.toLowerCase();

        // Map backend file types to frontend file types
        switch (selectedFileType) {
          case "image":
            return resourceFileType === "image";
          case "video":
            return resourceFileType === "video";
          case "audio":
            return resourceFileType === "audio";
          case "text":
            return resourceFileType === "text";
          case "pdf":
            return resourceFileType === "pdf";
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  // Since we're now doing server-side search, we don't need client-side filtering
  // The resources state will contain the search results directly
  const filteredResources = getFilteredResources(resources);

  return (
    <div className="space-y-8 bg-slate-50 min-h-screen p-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl border border-indigo-200">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <p className="text-gray-700 font-medium">
              Loading organizations and categories...
            </p>
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
              <h3 className="text-lg font-semibold text-red-800">
                Failed to load data
              </h3>
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
                Create and edit organizations and categories for better resource
                organization
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
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
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
                  <h3 className="text-xl font-bold text-gray-800">
                    Organizations & Categories
                  </h3>
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
                    <div className="text-sm text-gray-500">
                      Loading organizations...
                    </div>
                  </div>
                ) : organizations.length === 0 ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="text-sm text-gray-500">
                      No organizations found
                    </div>
                  </div>
                ) : (
                  organizations.map((org) => {
                    const orgCategories = organizationCategories[org.id] || [];
                    return (
                      <div
                        key={org.id}
                        className="p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <button
                                onClick={() =>
                                  toggleOrganizationCollapse(org.id)
                                }
                                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                                title={
                                  collapsedOrganizations[org.id]
                                    ? "Expand categories"
                                    : "Collapse categories"
                                }
                              >
                                {collapsedOrganizations[org.id] ? (
                                  <ChevronRight className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                              </button>
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-lg flex items-center justify-center shadow">
                                <Building className="w-4 h-4 text-white" />
                              </div>
                              <span
                                className="text-base font-semibold text-gray-900 truncate"
                                title={org.name}
                              >
                                {org.name}
                              </span>
                              {org.type === "global" && (
                                <Badge className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1">
                                  Global
                                </Badge>
                              )}
                            </div>
                            <p
                              className="text-sm text-gray-600 line-clamp-2 ml-11"
                              title={org.description || "No description"}
                            >
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
                        {!collapsedOrganizations[org.id] && (
                          <div className="ml-11 space-y-2 transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                  />
                                </svg>
                                Categories ({orgCategories.length})
                              </h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(null);
                                  setCategoryOrganizationId(org.id);
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
                              <div className="text-xs text-gray-500 italic">
                                No categories yet
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {orgCategories.map((category) => (
                                  <div
                                    key={category.id}
                                    className="p-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-sky-500 rounded flex items-center justify-center">
                                          <svg
                                            className="w-2 h-2 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                            />
                                          </svg>
                                        </div>
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-medium ${category.color} truncate`}
                                        >
                                          {category.name}
                                        </span>
                                      </div>
                                      <div className="flex gap-1 flex-shrink-0">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onMouseDown={(e) =>
                                            e.stopPropagation()
                                          }
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingCategory(category);
                                            setShowCategoryModal(true);
                                          }}
                                          className="relative z-10 pointer-events-auto text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 w-8 h-8 rounded p-0"
                                          title="Edit Category"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        {category.name.toLowerCase() !==
                                          "general" && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onMouseDown={(e) =>
                                              e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteCategory(category.id);
                                            }}
                                            className="relative z-10 pointer-events-auto text-red-600 hover:text-red-700 hover:bg-red-50 w-8 h-8 rounded p-0"
                                            title="Delete Category"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
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
            Upload images, videos, audio files, text files, and PDFs with
            titles, descriptions, and organization settings. Resources assigned
            to "Global Resources" will be visible to all users. Supported
            formats: Images (JPG, PNG, GIF), Videos (MP4, MOV, AVI), Audio (MP3,
            WAV), Text files (TXT, JSON, XML), PDFs (Max 1GB)
            {filteredResources.length > 0 && (
              <span className="block mt-2 text-indigo-200">
                📊 {filteredResources.length} asset(s) loaded - Use sorting
                options below to organize them
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-8">
          {/* --- Title --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Title *
              </label>
              <Input
                placeholder="Enter asset title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/30 rounded-xl transition-shadow duration-200 focus:shadow-lg"
              />
            </div>

            {/* --- Organization --- */}
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
                    setFormData((prev) => ({
                      ...prev,
                      organization: newOrgId,
                      category: "",
                    }));
                    if (newOrgId && newOrgId !== "") {
                      const orgCategories =
                        organizationCategories[newOrgId] || [];
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
                  {organizations.map((org) => (
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
                      const organization = organizations.find(
                        (org) => org.id === formData.organization,
                      );
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

          {/* --- Category --- */}
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Loading..." : "Select Category"}
                  </option>
                  {categories.map((category) => (
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
                    setCategoryOrganizationId(
                      formData.organization || pendingOrg,
                    );
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
                      const category = categories.find(
                        (cat) => cat.id === formData.category,
                      );
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

          {/* --- Description --- */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Description
            </label>
            <Textarea
              placeholder="Enter asset description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="border-2 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/30 rounded-xl transition-shadow duration-200 focus:shadow-md"
            />
          </div>

          {/* --- File Type --- */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              File Type *
            </label>
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow duration-200 focus:shadow-md"
              value={formData.file_type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, file_type: e.target.value }))
              }
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading..." : "Select File Type"}
              </option>
              <option value="IMAGE">IMAGE</option>
              <option value="VIDEO">VIDEO</option>
              <option value="AUDIO">AUDIO</option>
              <option value="TEXT">TEXT</option>
              <option value="PDF">PDF</option>
            </select>
          </div>

          {/* --- Select Files --- */}
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
                accept="image/*,video/*,audio/*,.txt,.json,.xml,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                className="mb-4 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-lg px-6 py-3 rounded-xl transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose Files
              </Button>
              <p className="text-base text-gray-600 font-medium">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: Images, Videos, Audio, Text files, PDFs (Max
                1GB)
              </p>
              <p className="text-xs text-blue-600 mt-1">
                💡 Large files up to 1GB are supported for high-quality content
              </p>
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Selected Files:
                  </p>
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        {file.type.startsWith("image/") ? (
                          <Image className="w-4 h-4" />
                        ) : file.type.startsWith("video/") ? (
                          <Video className="w-4 h-4" />
                        ) : file.type.startsWith("audio/") ? (
                          <FileText className="w-4 h-4" />
                        ) : file.type === "application/pdf" ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        <span>{file.name}</span>
                        <span
                          className={
                            file.size > 500 * 1024 * 1024
                              ? "text-orange-600 font-medium"
                              : "text-gray-500"
                          }
                        >
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          {file.size > 500 * 1024 * 1024 && (
                            <span className="text-xs ml-1">⚠️ Large file</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- Web Search Button (Unsplash + Pexels + Pixabay) --- */}
          <Button
            onClick={() => {
              const modal = document.getElementById("imageSearchModal");
              if (modal) modal.classList.remove("hidden");
            }}
            className="w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-xl py-4 rounded-xl text-lg font-semibold transition-transform duration-200 hover:-translate-y-0.5"
          >
            Web Search
          </Button>

          {/* --- Upload Assets Button --- */}
          <Button
            onClick={handleUpload}
            disabled={
              uploading ||
              loading ||
              selectedFiles.length === 0 ||
              !formData.title.trim() ||
              !formData.organization ||
              !formData.category ||
              !formData.file_type
            }
            className="w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-xl py-4 rounded-xl text-lg font-semibold transition-transform duration-200 hover:-translate-y-0.5"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Uploading...{" "}
                {selectedFiles.length > 0 &&
                  selectedFiles[0].size > 100 * 1024 * 1024 && (
                    <span className="text-xs">
                      (Large file - may take a moment)
                    </span>
                  )}
              </div>
            ) : (
              "Upload Assets"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* --- Combined Modal (Unsplash + Pexels + Pixabay) --- */}
      <div
        id="imageSearchModal"
        className="hidden fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95%] overflow-hidden relative flex flex-col">
          {/* Modal Header */}
          <div className="bg-gray-50 border-b border-gray-200 p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-gray-800">
                  Image Search
                </h2>
                <p className="text-gray-600 text-sm">
                  Find high-quality images from Unsplash and Pixabay
                </p>
              </div>
              <button
                onClick={() => {
                  const modal = document.getElementById("imageSearchModal");
                  if (modal) modal.classList.add("hidden");
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-2 rounded-full transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Pre-loaded Finance Templates */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Quick Finance Templates
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  "business finance",
                  "investment",
                  "money",
                  "banking",
                  "financial planning",
                  "stock market",
                  "wealth management",
                  "accounting",
                  "budget",
                  "credit",
                  "loan",
                  "mortgage",
                  "insurance",
                  "retirement",
                  "tax",
                  "economics",
                ].map((template) => (
                  <button
                    key={template}
                    onClick={() => {
                      const queryInput =
                        document.getElementById("imageSearchQuery");
                      if (queryInput) {
                        queryInput.value = template;
                      }
                    }}
                    className="px-4 py-2.5 text-sm bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 capitalize font-medium"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Custom Search
                </h3>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    id="imageSearchQuery"
                    type="text"
                    placeholder="Type your search query here..."
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const queryInput =
                      document.getElementById("imageSearchQuery");
                    const query = queryInput ? queryInput.value : "";
                    const resultsDiv =
                      document.getElementById("imageSearchResults");
                    if (!resultsDiv) return;

                    // Show loading state
                    resultsDiv.innerHTML = `
                  <div class="flex items-center justify-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
                    <span class="ml-3 text-gray-600">Searching for images...</span>
                  </div>
                `;

                    try {
                      // Unsplash
                      const UNSPLASH_KEY =
                        "80kWci6xr65tHJChHAG2cj8qDxsIs1TmAFnkka1C-Mk";
                      const unsplashRes = await fetch(
                        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=15`,
                        {
                          headers: {
                            Authorization: `Client-ID ${UNSPLASH_KEY}`,
                          },
                        },
                      );
                      const unsplashData = await unsplashRes.json();

                      // Clear loading state
                      resultsDiv.innerHTML = "";

                      if (
                        !unsplashData.results ||
                        unsplashData.results.length === 0
                      ) {
                        resultsDiv.innerHTML = `
                      <div class="text-center py-12">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                        <p class="text-gray-500">Try a different search term or use one of the finance templates above.</p>
                      </div>
                    `;
                        return;
                      }

                      (unsplashData.results || []).forEach((photo) => {
                        const wrapper = document.createElement("div");
                        wrapper.className =
                          "img-wrapper inline-block w-full mb-6 cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white";

                        // --- Unsplash Image ---
                        const img = document.createElement("img");
                        img.src = photo.urls.small;
                        img.alt = photo.alt_description || "Unsplash image";
                        img.className =
                          "w-full h-auto block rounded-t-xl hover:scale-105 transition-transform duration-300";

                        // When the user clicks/chooses this image:
                        img.onclick = async () => {
                          const previewImg =
                            document.getElementById("previewImage");
                          if (previewImg) previewImg.src = photo.urls.full;

                          const previewModal =
                            document.getElementById("previewModal");
                          if (previewModal) {
                            previewModal.dataset.source = "unsplash";
                            previewModal.dataset.downloadUrl =
                              photo.links.download_location;
                            previewModal.classList.remove("hidden");

                            console.log(
                              "Preview modal opened for Unsplash image",
                            );
                            console.log(
                              "Download URL stored:",
                              photo.links.download_location,
                            );

                            // Also track the download immediately when user selects the image
                            try {
                              console.log(
                                "Tracking download on image selection...",
                              );
                              const downloadResponse = await fetch(
                                photo.links.download_location,
                                {
                                  method: "GET",
                                  headers: {
                                    Authorization:
                                      "Client-ID 80kWci6xr65tHJChHAG2cj8qDxsIs1TmAFnkka1C-Mk",
                                  },
                                  mode: "cors",
                                },
                              );

                              if (downloadResponse.ok) {
                                console.log(
                                  "✅ Download tracked on image selection!",
                                );
                              } else {
                                console.log(
                                  "❌ Download tracking failed on selection:",
                                  downloadResponse.status,
                                );
                              }
                            } catch (error) {
                              console.error(
                                "❌ Error tracking download on selection:",
                                error,
                              );
                            }
                          }
                        };

                        wrapper.appendChild(img);

                        // --- Required Attribution ---
                        const credit = document.createElement("div");
                        credit.className =
                          "text-xs text-gray-500 p-3 bg-gray-50 border-t border-gray-100";
                        credit.innerHTML = `Photo by 
                      <a href="${photo.user.links.html}?utm_source=ATHENA_LMS&utm_medium=referral" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="underline text-gray-700 hover:text-gray-900">
                        ${photo.user.name}
                      </a> on 
                      <a href="https://unsplash.com/?utm_source=ATHENA_LMS&utm_medium=referral" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="underline text-gray-700 hover:text-gray-900">
                        Unsplash
                      </a>`;
                        wrapper.appendChild(credit);

                        resultsDiv.appendChild(wrapper);
                      });
                    } catch (error) {
                      resultsDiv.innerHTML = `
                    <div class="text-center py-12">
                      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <h3 class="text-lg font-medium text-gray-900 mb-2">Search failed</h3>
                      <p class="text-gray-500">There was an error searching for images. Please try again.</p>
                    </div>
                  `;
                    }

                    // // Pexels
                    // const PEXELS_KEY = "W4RFJr0wYkRJfOIU5pXOo0VCQsHbPMAW1jR70wDxUpyE4kQexpdWkzJw";
                    // const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=15`, {
                    //   headers: { Authorization: PEXELS_KEY }
                    // });
                    // const pexelsData = await pexelsRes.json();
                    // (pexelsData.photos || []).forEach(photo => {
                    //   const wrapper = document.createElement("div");
                    //   wrapper.className = "img-wrapper inline-block w-full mb-4 cursor-pointer rounded-lg overflow-hidden shadow-md";
                    //   const img = document.createElement("img");
                    //   img.src = photo.src.medium;
                    //   img.alt = photo.alt || "Pexels image";
                    //   img.className = "w-full h-auto block rounded-lg hover:scale-105 transition-transform";
                    //   img.onclick = () => {
                    //     const previewImg = document.getElementById("previewImage");
                    //     if (previewImg) previewImg.src = photo.src.large;
                    //     const previewModal = document.getElementById("previewModal");
                    //     if (previewModal) {
                    //       previewModal.dataset.source = "pexels";
                    //       previewModal.classList.remove("hidden");
                    //     }
                    //   };
                    //   wrapper.appendChild(img);
                    //   resultsDiv.appendChild(wrapper);
                    // });

                    // Pixabay
                    const PIXABAY_KEY = "52197445-09bbdec7dc5671aa2bbe2830a";
                    const pixabayRes = await fetch(
                      `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&per_page=15`,
                    );
                    const pixabayData = await pixabayRes.json();
                    (pixabayData.hits || []).forEach((photo) => {
                      const wrapper = document.createElement("div");
                      wrapper.className =
                        "img-wrapper inline-block w-full mb-4 cursor-pointer rounded-lg overflow-hidden shadow-md";
                      const img = document.createElement("img");
                      img.src = photo.webformatURL;
                      img.alt = photo.tags || "Pixabay image";
                      img.className =
                        "w-full h-auto block rounded-lg hover:scale-105 transition-transform";
                      img.onclick = () => {
                        const previewImg =
                          document.getElementById("previewImage");
                        if (previewImg) previewImg.src = photo.largeImageURL;
                        const previewModal =
                          document.getElementById("previewModal");
                        if (previewModal) {
                          previewModal.dataset.source = "pixabay";
                          previewModal.classList.remove("hidden");
                        }
                      };
                      wrapper.appendChild(img);
                      resultsDiv.appendChild(wrapper);
                    });
                  }}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search Images
                </button>
              </div>

              {/* Results Section */}
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Search Results
                  </h3>
                </div>
                <div
                  id="imageSearchResults"
                  className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Preview Modal --- */}
      <div
        id="previewModal"
        className="hidden fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[95%] overflow-hidden">
          {/* Preview Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Image Preview
                </h3>
                <p className="text-gray-600 text-sm">
                  Review the image before adding to your upload list
                </p>
              </div>
              <button
                onClick={() => {
                  const previewModalElem =
                    document.getElementById("previewModal");
                  if (previewModalElem)
                    previewModalElem.classList.add("hidden");
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-2 rounded-full transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <img
                id="previewImage"
                src=""
                alt="Preview"
                className="max-w-full max-h-[60vh] rounded-xl shadow-lg mx-auto"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  const previewImgElem =
                    document.getElementById("previewImage");
                  const url = previewImgElem ? previewImgElem.src : "";
                  const previewModalElem =
                    document.getElementById("previewModal");
                  const source = previewModalElem
                    ? previewModalElem.dataset.source
                    : "";
                  const downloadUrl = previewModalElem
                    ? previewModalElem.dataset.downloadUrl
                    : "";

                  if (!url) return alert("No image selected");

                  // Note: Download tracking is now handled on image selection to avoid duplicates
                  console.log("Adding image to upload list:", { source, url });

                  setSelectedFiles((prev) => [
                    ...prev,
                    {
                      name: `${source}-image.jpg`,
                      size: 500000,
                      type: "image/jpeg",
                      url,
                      source,
                    },
                  ]);
                  alert(
                    `${source} image added to upload list. Fill details and click 'Upload Assets'.`,
                  );
                  if (previewModalElem)
                    previewModalElem.classList.add("hidden");
                  const searchModal =
                    document.getElementById("imageSearchModal");
                  if (searchModal) searchModal.classList.add("hidden");
                }}
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add to Upload List
              </button>
              <button
                onClick={() => {
                  const previewModalElem =
                    document.getElementById("previewModal");
                  if (previewModalElem)
                    previewModalElem.classList.add("hidden");
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

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
                    if (e.key === "Enter") {
                      handleGlobalSearch();
                    }
                  }}
                  className="text-sm pr-10 bg-white border-white/30 focus:bg-white focus:border-white rounded-xl text-gray-800 placeholder:text-gray-500"
                />
                {searchTerm && (
                  <button
                    onClick={async () => {
                      setSearchTerm("");
                      // Restore original assets view if organization and category are selected
                      if (pendingOrg && pendingCat) {
                        try {
                          setAssetsLoading(true);
                          const payload = {
                            organization_id:
                              pendingOrg === "Global" ? "Global" : pendingOrg,
                            category_id:
                              pendingCat === "All" ? "All" : pendingCat,
                          };
                          const res = await assetService.getAssets(payload);
                          const list = res?.data || [];
                          const normalized = list.map((item, idx) => {
                            // Determine file type from backend file_type field or fallback to mime type
                            const getFileTypeFromBackend = (
                              backendFileType,
                              mimeType,
                            ) => {
                              // If backend provides file_type, use it
                              if (backendFileType) {
                                return backendFileType.toLowerCase();
                              }

                              // Fallback to mime type detection
                              if (mimeType.startsWith("image/")) return "image";
                              if (mimeType.startsWith("video/")) return "video";
                              if (mimeType.startsWith("audio/")) return "audio";
                              if (mimeType === "application/pdf") return "pdf";
                              if (
                                mimeType.startsWith("text/") ||
                                mimeType === "application/json" ||
                                mimeType === "application/xml"
                              )
                                return "text";
                              return "text"; // default
                            };

                            return {
                              id: item?.id || item?._id || idx,
                              title: item?.title || "Untitled",
                              description: item?.description || "",
                              category: item?.category_id || pendingCat,
                              organization: item?.organization_id || pendingOrg,
                              visibility:
                                pendingOrg === "Global"
                                  ? "global"
                                  : "organization",
                              fileName:
                                item?.fileName ||
                                item?.filename ||
                                item?.name ||
                                "asset",
                              fileType: getFileTypeFromBackend(
                                item?.file_type,
                                item?.mimetype || item?.type || "",
                              ),
                              fileSize: (
                                (item?.filesize ?? 0) /
                                (1024 * 1024)
                              ).toFixed(2),
                              uploadDate:
                                item?.createdAt || new Date().toISOString(),
                              url:
                                item?.assetUrl ||
                                item?.asset_url ||
                                item?.url ||
                                item?.Location ||
                                item?.fileUrl ||
                                "",
                            };
                          });
                          setResources(normalized);
                          // Reset file type filter when assets are restored
                          setPendingFileType("all");
                        } catch (error) {
                          console.error("Error restoring assets:", error);
                          setResources([]);
                        } finally {
                          setAssetsLoading(false);
                        }
                      } else {
                        setResources([]);
                      }
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                    disabled={assetsLoading}
                  >
                    {assetsLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleGlobalSearch}
                disabled={
                  searchLoading ||
                  !searchTerm.trim() ||
                  searchTerm.trim().length < 2
                }
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 px-6 py-2 rounded-xl font-medium"
              >
                {searchLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Search className="w-4 h-4" />
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
                    setPendingFileType("all"); // Reset file type selection

                    // Update categories for the selected organization
                    if (newOrgValue && newOrgValue !== "Global") {
                      const orgCategories =
                        organizationCategories[newOrgValue] || [];
                      setCategories(orgCategories);
                    } else if (newOrgValue === "Global") {
                      // For Global, do not allow selecting a specific category
                      setCategories([]);
                    } else {
                      setCategories([]);
                    }
                  }}
                  disabled={loading}
                >
                  <option value="">
                    {loading
                      ? "Loading organizations..."
                      : "Select Organization"}
                  </option>
                  <option value="Global">Global</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              {pendingOrg !== "Global" && (
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
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-end">
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-lg py-3 rounded-xl font-semibold transition-transform duration-200 hover:-translate-y-0.5"
                  onClick={async () => {
                    try {
                      setAssetsLoading(true);

                      // Prepare payload based on selections
                      const payload = {
                        organization_id:
                          pendingOrg === "Global" ? "Global" : pendingOrg,
                        category_id: pendingCat === "All" ? "All" : pendingCat,
                      };

                      const res = await assetService.getAssets(payload);
                      const list = res?.data || [];

                      const normalized = list.map((item, idx) => {
                        // Determine file type from backend file_type field or fallback to mime type
                        const getFileTypeFromBackend = (
                          backendFileType,
                          mimeType,
                        ) => {
                          // If backend provides file_type, use it
                          if (backendFileType) {
                            return backendFileType.toLowerCase();
                          }

                          // Fallback to mime type detection
                          if (mimeType.startsWith("image/")) {
                            return "image";
                          }
                          if (mimeType.startsWith("video/")) {
                            return "video";
                          }
                          if (mimeType.startsWith("audio/")) {
                            return "audio";
                          }
                          if (mimeType === "application/pdf") {
                            return "pdf";
                          }
                          if (
                            mimeType.startsWith("text/") ||
                            mimeType === "application/json" ||
                            mimeType === "application/xml"
                          ) {
                            return "text";
                          }
                          return "text"; // default
                        };

                        return {
                          id: item?.id || item?._id || idx,
                          title: item?.title || "Untitled",
                          description: item?.description || "",
                          category: item?.category_id || pendingCat,
                          organization: item?.organization_id || pendingOrg,
                          visibility:
                            pendingOrg === "Global" ? "global" : "organization",
                          fileName:
                            item?.fileName ||
                            item?.filename ||
                            item?.name ||
                            "asset",
                          fileType: getFileTypeFromBackend(
                            item?.file_type,
                            item?.mimetype || item?.type || "",
                          ),
                          fileSize: (
                            (item?.filesize ?? 0) /
                            (1024 * 1024)
                          ).toFixed(2),
                          uploadDate:
                            item?.createdAt || new Date().toISOString(),
                          url:
                            item?.assetUrl ||
                            item?.asset_url ||
                            item?.url ||
                            item?.Location ||
                            item?.fileUrl ||
                            "",
                        };
                      });
                      setResources(normalized);
                      setFilterOrganization(pendingOrg);
                      setFilterCategory(pendingCat);
                      // Reset file type filter when new assets are loaded
                      setPendingFileType("all");
                      toast({
                        title: "Assets loaded",
                        description: `${normalized.length} asset(s) fetched.`,
                      });
                    } catch (e) {
                      toast({
                        title: "Failed to load assets",
                        description:
                          "Check organization/category selection and try again.",
                        variant: "destructive",
                      });
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

          {/* File Type Filter - Always visible to allow resetting even when empty */}
          <div className="space-y-4 mb-6">
            {/* File Type Filter Controls */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  File Type:
                </span>
                <select
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm bg-white shadow-sm"
                  value={pendingFileType}
                  onChange={(e) => setPendingFileType(e.target.value)}
                >
                  <option value="all">All File Types</option>
                  <option value="IMAGE">Images</option>
                  <option value="VIDEO">Videos</option>
                  <option value="AUDIO">Audio Files</option>
                  <option value="TEXT">Text Files</option>
                  <option value="PDF">PDFs</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                  {filteredResources.length} asset(s) found
                </div>
                <div className="flex gap-2">
                  {pendingFileType !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingFileType("all")}
                      className="text-xs px-2 py-1 h-7 bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                    >
                      Reset Filter
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* File Type Filter Summary */}
            {pendingFileType !== "all" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="space-y-2">
                  {/* File Type Filter Summary */}
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="font-medium">
                      Showing only{" "}
                      {pendingFileType === "IMAGE"
                        ? "Images"
                        : pendingFileType === "VIDEO"
                          ? "Videos"
                          : pendingFileType === "AUDIO"
                            ? "Audio Files"
                            : pendingFileType === "TEXT"
                              ? "Text Files"
                              : pendingFileType === "PDF"
                                ? "PDFs"
                                : pendingFileType}{" "}
                      files
                    </span>
                  </div>

                  {/* Available File Types Info */}
                  {resources.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Available file types:{" "}
                        {(() => {
                          const fileTypes = [
                            ...new Set(
                              resources.map((r) => r.fileType).filter(Boolean),
                            ),
                          ];
                          return fileTypes.length > 0
                            ? fileTypes.join(", ")
                            : "None detected";
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {filteredResources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-lg font-semibold mb-2">
                {pendingFileType !== "all"
                  ? `No ${
                      pendingFileType === "IMAGE"
                        ? "images"
                        : pendingFileType === "VIDEO"
                          ? "videos"
                          : pendingFileType === "AUDIO"
                            ? "audio files"
                            : pendingFileType === "TEXT"
                              ? "text files"
                              : pendingFileType === "PDF"
                                ? "PDFs"
                                : pendingFileType.toLowerCase()
                    } found.`
                  : "No assets found."}
              </p>
              <p className="text-sm">
                {pendingFileType !== "all"
                  ? `Try changing the file type filter or organization/category selection.`
                  : "Try changing organization/category or search text."}
              </p>
              {pendingFileType !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingFileType("all")}
                  className="mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Show All File Types
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredResources.map((resource) => {
                const organization = organizations.find(
                  (org) => org.id === resource.organization,
                );
                const category = categories.find(
                  (cat) => cat.id === resource.category,
                );
                return (
                  <div
                    key={resource.id}
                    className="flex flex-col rounded-3xl p-6 shadow-xl border border-slate-100 bg-white hover:bg-slate-50 transition-all duration-300 ring-1 ring-slate-100 hover:ring-indigo-200 transform hover:-translate-y-2"
                  >
                    {/* File Type Filter Indicator */}
                    {pendingFileType !== "all" && (
                      <div className="flex justify-end mb-2">
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                          Filtered: {resource.fileType.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div
                        className="text-base md:text-lg font-semibold text-gray-900"
                        title={resource.title}
                      >
                        {resource.title || "Untitled asset"}
                      </div>
                      <div className="flex items-start gap-2 text-xs text-gray-700 min-w-0">
                        {getFileIcon(resource.fileType)}
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline break-words whitespace-pre-wrap w-full"
                          title={resource.url}
                        >
                          {resource.url}
                        </a>
                      </div>
                      {resource.description ? (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {resource.description}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {category ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] ${category.color}`}
                          >
                            {category.name}
                          </span>
                        ) : null}
                        <div
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-800"
                          title={organization?.name || "Unknown Org"}
                        >
                          <Building className="w-3 h-3 mr-1" />
                          {organization?.name || "Unknown Org"}
                        </div>
                        {resource.fileSize ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-purple-100 text-purple-800">
                            {resource.fileSize} MB
                          </span>
                        ) : null}
                        {/* File Type Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            resource.fileType === "image"
                              ? "bg-green-100 text-green-800"
                              : resource.fileType === "video"
                                ? "bg-red-100 text-red-800"
                                : resource.fileType === "audio"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : resource.fileType === "pdf"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {resource.fileType.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-6">
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:bg-indigo-50 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-600 shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
                        onClick={() => {
                          navigator.clipboard.writeText(resource.url);
                          toast({
                            title: "Copied",
                            description: "Link copied to clipboard",
                          });
                        }}
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
          onSave={
            editingOrganization
              ? handleEditOrganization
              : handleCreateOrganization
          }
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
            setCategoryOrganizationId(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <DeleteConfirmModal
          item={deleteItem}
          type={deleteType}
          onConfirm={
            deleteType === "organization"
              ? confirmDeleteOrganization
              : confirmDeleteCategory
          }
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
          onClose={() => {
            setShowEditAssetModal(false);
            setEditingAsset(null);
          }}
        />
      )}
    </div>
  );
};

// Organization Modal Component
const OrganizationModal = ({ organization, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    description: organization?.description || "",
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter organization description (optional)"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{organization ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ category, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: category?.name || "",
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
            <Button type="submit">{category ? "Update" : "Create"}</Button>
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
        warning: "This action cannot be undone.",
      };
    } else if (type === "category") {
      return {
        title: "Delete Category",
        message: `Are you sure you want to delete the category "${item.name}"?`,
        warning: "This action cannot be undone.",
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
            <p className="text-sm text-red-600 font-medium">
              {typeInfo.warning}
            </p>
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
  const [local, setLocal] = useState({
    title: asset?.title || "",
    description: asset?.description || "",
  });

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input
              value={local.title}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter asset title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={local.description}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Resources;
