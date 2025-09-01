import React, { useState, useRef } from "react";
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
  Eye,
  Calendar,
  FileImage,
  FileVideo,
  Plus,
  Edit,
  Building,
  Globe,
  Users,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [uploading, setUploading] = useState(false);
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
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    organization: ""
  });

  // Sample data - in real app, this would come from backend
  const [organizations, setOrganizations] = useState([
    { id: "1", name: "Global Resources", type: "global" },
    { id: "2", name: "Acme Corporation", type: "organization" },
    { id: "3", name: "Tech Solutions Inc", type: "organization" },
    { id: "4", name: "Education Foundation", type: "organization" }
  ]);

  const [categories, setCategories] = useState([
    { id: "1", name: "General", color: "bg-gray-100 text-gray-800" },
    { id: "2", name: "Course Material", color: "bg-blue-100 text-blue-800" },
    { id: "3", name: "Lesson Resource", color: "bg-green-100 text-green-800" },
    { id: "4", name: "Reference Material", color: "bg-purple-100 text-purple-800" },
    { id: "5", name: "Template", color: "bg-orange-100 text-orange-800" }
  ]);

  // Initialize defaults for pending selectors to first available items
  React.useEffect(() => {
    if (organizations?.length && (pendingOrg === "all" || !pendingOrg)) {
      setPendingOrg(organizations[0].id);
    }
  }, [organizations]);

  React.useEffect(() => {
    if (categories?.length && (pendingCat === "all" || !pendingCat)) {
      setPendingCat(categories[0].id);
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
    if (!formData.title.trim() || selectedFiles.length === 0 || !formData.category || !formData.organization) {
      toast({
        title: "Missing information",
        description: "Please provide title, category, organization, and select at least one file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Simulate file upload - in real implementation, you'd upload to your backend
      const newResources = selectedFiles.map((file, index) => {
        const resource = {
          id: Date.now() + index,
          title: formData.title,
          description: formData.description,
          category: formData.category,
                     organization: formData.organization,
           visibility: organizations.find(org => org.id === formData.organization)?.type === "global" ? "global" : "organization",
          fileName: file.name,
          fileType: file.type.startsWith('image/') ? 'image' : 'video',
          fileSize: (file.size / (1024 * 1024)).toFixed(2), // Convert to MB
          uploadDate: new Date().toISOString(),
          url: URL.createObjectURL(file), // In real app, this would be the uploaded file URL
          thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        };
        return resource;
      });

      setResources(prev => [...newResources, ...prev]);
      
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
        description: `${newResources.length} resource(s) uploaded successfully.`,
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

  const handleDelete = (resourceId) => {
    setResources(prev => prev.filter(resource => resource.id !== resourceId));
    setSelectedResources(prev => prev.filter(id => id !== resourceId));
    toast({
      title: "Resource deleted",
      description: "The resource has been removed successfully.",
    });
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
    if (selectedResources.length === filteredResources.length) {
      setSelectedResources([]);
    } else {
      setSelectedResources(filteredResources.map(resource => resource.id));
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
  const handleCreateOrganization = (orgData) => {
      const newOrg = {
      id: Date.now().toString(),
      name: orgData.name,
      type: "organization"
    };
    setOrganizations(prev => [...prev, newOrg]);
    setShowOrganizationModal(false);
    toast({
      title: "Organization created",
      description: `${orgData.name} has been created successfully.`,
    });
  };

  const handleEditOrganization = (orgData) => {
    setOrganizations(prev => 
      prev.map(org => 
        org.id === editingOrganization.id 
          ? { ...org, name: orgData.name }
          : org
      )
    );
    setShowOrganizationModal(false);
    setEditingOrganization(null);
    toast({
      title: "Organization updated",
      description: `${orgData.name} has been updated successfully.`,
    });
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

  const confirmDeleteOrganization = () => {
    if (!deleteItem || deleteType !== "organization") return;
    
    setOrganizations(prev => prev.filter(org => org.id !== deleteItem.id));
    
    // Clear form if the deleted organization was selected
    if (formData.organization === deleteItem.id) {
      setFormData(prev => ({ ...prev, organization: "" }));
    }
    
    toast({
      title: "Organization deleted",
      description: `${deleteItem.name} has been deleted successfully.`,
    });
    
    setShowDeleteConfirmModal(false);
    setDeleteItem(null);
    setDeleteType(null);
  };

  // Category Management
  const handleCreateCategory = (categoryData) => {
    const newCategory = {
      id: Date.now().toString(),
      name: categoryData.name,
      color: getCategoryColor(categoryData.name)
    };
    setCategories(prev => [...prev, newCategory]);
    setShowCategoryModal(false);
    toast({
      title: "Category created",
      description: `${categoryData.name} has been created successfully.`,
    });
  };

  const handleEditCategory = (categoryData) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: categoryData.name, color: getCategoryColor(categoryData.name) }
          : cat
      )
    );
    setShowCategoryModal(false);
    setEditingCategory(null);
    toast({
      title: "Category updated",
      description: `${categoryData.name} has been updated successfully.`,
    });
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

  const confirmDeleteCategory = () => {
    if (!deleteItem || deleteType !== "category") return;
    
    setCategories(prev => prev.filter(cat => cat.id !== deleteItem.id));
    
    // Clear form if the deleted category was selected
    if (formData.category === deleteItem.id) {
      setFormData(prev => ({ ...prev, category: "" }));
    }
    
    toast({
      title: "Category deleted",
      description: `${deleteItem.name} has been deleted successfully.`,
    });
    
    setShowDeleteConfirmModal(false);
    setDeleteItem(null);
    setDeleteType(null);
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

  // Filter resources based on search term, category, and organization
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || resource.category === filterCategory;
    const matchesOrganization = filterOrganization === "all" || resource.organization === filterOrganization;
    return matchesSearch && matchesCategory && matchesOrganization;
  });

  return (
    <div className="space-y-6">
      {/* Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Manage Organizations & Categories
          </CardTitle>
          <CardDescription>
            Create and edit organizations and categories for better resource organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organizations Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Organizations</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingOrganization(null);
                    setShowOrganizationModal(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Organization
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {organizations.map(org => (
                  <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{org.name}</span>
                              {org.type === "global" && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Global</Badge>
                              )}
                            </div>
                                         <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingOrganization(org);
                                setShowOrganizationModal(true);
                              }}
                         className="text-gray-600 hover:text-gray-800"
                              title="Edit Organization"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {org.type !== "global" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOrganization(org.id)}
                           className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete Organization"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                     </div>
                  </div>
                ))}
                          </div>
                        </div>
                        
            {/* Categories Management */}
            <div className="space-y-4">
                          <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCategory(null);
                                setShowCategoryModal(true);
                              }}
                  className="flex items-center gap-2"
                            >
                  <Plus className="w-4 h-4" />
                              Add Category
                            </Button>
                          </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className={category.color}>{category.name}</Badge>
                                      </div>
                                         <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingCategory(category);
                                          setShowCategoryModal(true);
                                        }}
                         className="text-gray-600 hover:text-gray-800"
                                        title="Edit Category"
                                      >
                         <Edit className="w-4 h-4" />
                                      </Button>
                                      {category.name.toLowerCase() !== "general" && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteCategory(category.id)}
                           className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          title="Delete Category"
                                        >
                           <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                  </div>
                                </div>
                              ))}
                            </div>
                        </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Assets
          </CardTitle>
                     <CardDescription>
             Upload images and videos with titles, descriptions, and organization settings. Resources assigned to "Global Resources" will be visible to all users. Supported formats: JPG, PNG, GIF, MP4, MOV, AVI (Max 100MB)
           </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Enter asset title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
                          <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
              <div className="flex gap-2">
                <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">Select Category</option>
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
                    className="px-3"
                    title="Add New Category"
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
                    className="px-3"
                    title="Edit Selected Category"
                    disabled={!formData.category}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                <label className="text-sm font-medium">Organization *</label>
              <div className="flex gap-2">
                <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.organization}
                    onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  >
                    <option value="">Select Organization</option>
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
                    className="px-3"
                    title="Add New Organization"
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
                    className="px-3"
                    title="Edit Selected Organization"
                    disabled={!formData.organization}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Enter asset description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Files *</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
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
                className="mb-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              <p className="text-sm text-gray-600">
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
            disabled={uploading || selectedFiles.length === 0 || !formData.title.trim() || !formData.category || !formData.organization}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload Assets"}
          </Button>
        </CardContent>
      </Card>

      {/* Resources List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Uploaded Assets ({filteredResources.length} of {resources.length})
          </CardTitle>
          <CardDescription>
            Manage and organize your uploaded assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Select Organization/Category and apply */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Organization</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={pendingOrg}
                  onChange={(e) => setPendingOrg(e.target.value)}
                >
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={pendingCat}
                  onChange={(e) => setPendingCat(e.target.value)}
                  disabled={organizations.find(o => o.id === pendingOrg)?.type === "global"}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full"
                  onClick={() => {
                    const selectedOrg = organizations.find(o => o.id === pendingOrg);
                    // If Global organization, show all organizations' assets (ignore category)
                    if (selectedOrg?.type === "global") {
                      setFilterOrganization("all");
                      setFilterCategory("all");
                      return;
                    }
                    // If category is General, show all categories within selected organization
                    const selectedCat = categories.find(c => c.id === pendingCat);
                    if (selectedCat && selectedCat.name.toLowerCase() === "general") {
                      setFilterOrganization(pendingOrg);
                      setFilterCategory("all");
                      return;
                    }
                    // Otherwise, filter by both
                    setFilterOrganization(pendingOrg);
                    setFilterCategory(pendingCat);
                  }}
                >
                  Show Assets
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          {resources.length > 0 && (
            <div className="mb-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Assets</label>
                  <Input
                    placeholder="Search by title, description, or filename..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Organization</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterOrganization}
                    onChange={(e) => setFilterOrganization(e.target.value)}
                  >
                    <option value="all">All Organizations</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
                
              </div>
              
                             {/* Reset Filters */}
               {(searchTerm || filterCategory !== "all" || filterOrganization !== "all") && (
                 <div className="flex justify-end">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                       setSearchTerm("");
                       setFilterCategory("all");
                       setFilterOrganization("all");
                     }}
                     className="text-gray-600 hover:text-gray-800"
                   >
                     Clear Filters
                   </Button>
                 </div>
               )}
              
              {/* Bulk Actions */}
              {filteredResources.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedResources.length === filteredResources.length && filteredResources.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                      Select All ({selectedResources.length} of {filteredResources.length})
                    </label>
                  </div>
                  {selectedResources.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected ({selectedResources.length})
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {resources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No resources uploaded yet.</p>
              <p className="text-sm">Upload your first resource using the form above.</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No resources match your search criteria.</p>
              <p className="text-sm">Try adjusting your search or filter settings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => {
                const category = categories.find(cat => cat.id === resource.category);
                const organization = organizations.find(org => org.id === resource.organization);
                
                return (
                  <Card key={resource.id} className="overflow-hidden">
                    <div className="relative">
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedResources.includes(resource.id)}
                          onChange={() => handleResourceSelect(resource.id)}
                          className="w-5 h-5 rounded border-gray-300 bg-white shadow-sm"
                        />
                      </div>
                      
                      {resource.fileType === 'image' ? (
                        <img
                          src={resource.thumbnail}
                          alt={resource.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <Video className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className={category?.color || "bg-gray-100 text-gray-800"}>
                          {category?.name || "Unknown"}
                        </Badge>
                      </div>
                      
                      {/* Visibility Badge */}
                      <div className="absolute bottom-2 right-2">
                        <Badge className={resource.visibility === "global" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                          {getVisibilityIcon(resource.visibility)}
                          <span className="ml-1">{resource.visibility === "global" ? "Global" : "Org"}</span>
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {resource.title}
                        </h3>
                      </div>
                      
                      {resource.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      
                      {/* Organization Info */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Building className="w-3 h-3" />
                        <span>{organization?.name || "Unknown Organization"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        {getFileIcon(resource.fileType)}
                        <span>{resource.fileName}</span>
                        <span>•</span>
                        <span>{resource.fileSize} MB</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(resource.uploadDate)}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(resource.url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = resource.url;
                            link.download = resource.fileName;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(resource.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
    </div>
  );
};

// Organization Modal Component
const OrganizationModal = ({ organization, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: organization?.name || ""
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
              Organization Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="Enter organization name"
              required
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

export default Resources;
