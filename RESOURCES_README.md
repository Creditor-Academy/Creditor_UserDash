# Resources Section - Instructor Portal

## Overview
The Resources section allows instructors to upload, manage, and organize images and videos with titles and descriptions. This feature includes organization management and automatic visibility controls, enabling instructors to create, edit, and delete organizations, categories, and control resource visibility through organization selection.

## Features

### Organization & Category Management
- **Create Organizations**: Add new organizations for resource grouping
- **Edit Organizations**: Modify existing organization names and details
- **Delete Organizations**: Remove organizations when they're no longer needed (with safety checks)
- **Create Categories**: Add new resource categories with automatic color coding
- **Edit Categories**: Modify existing category names and properties
- **Delete Categories**: Remove categories when they're no longer needed (with safety checks)
- **Automatic Visibility Control**: Resources are automatically global or organization-specific based on organization selection

### File Upload
- **Supported Formats**: Images (JPG, PNG, GIF) and Videos (MP4, MOV, AVI)
- **File Size Limit**: Maximum 100MB per file
- **Multiple Files**: Upload multiple files at once
- **Drag & Drop**: Drag and drop files directly onto the upload area
- **Organization Assignment**: Assign resources to specific organizations
- **Smart Visibility**: Resources assigned to "Global Resources" are automatically visible to all users

### Resource Management
- **Title & Description**: Add descriptive information for each resource
- **Organization Selection**: Choose which organization the resource belongs to
- **Category Assignment**: Organize resources into customizable categories
- **Automatic Visibility**: Visibility is determined by organization type (no separate field needed)

### Search & Filter
- **Search**: Find resources by title, description, or filename
- **Category Filter**: Filter resources by category
- **Organization Filter**: Filter resources by organization
- **Clear Filters**: Reset all search and filter settings

### Bulk Operations
- **Select All**: Select all resources in current view
- **Bulk Delete**: Delete multiple selected resources at once
- **Individual Selection**: Select specific resources using checkboxes

### Resource Actions
- **View**: Open resource in new tab
- **Download**: Download resource to local device
- **Delete**: Remove individual resources

## How to Use

### Managing Organizations & Categories
1. Navigate to the Instructor Portal
2. Click on the "Resources" tab in the left sidebar
3. In the "Manage Organizations & Categories" section:
   - Click "Add Organization" to create new organizations
   - Click "Add Category" to create new resource categories
   - Use the edit buttons (pencil icon) to modify existing items
   - Use the delete buttons (trash icon) to remove items when no longer needed
   - Organizations marked with "Global" badge are system-wide and cannot be deleted
   - The "General" category is a default system category and cannot be deleted

### Uploading Resources
1. Fill in the title and description fields
2. Select a category from the dropdown (or create a new one)
3. Choose an organization from the dropdown (or create a new one)
   - **"Global Resources"** = automatically visible to all users
   - **Any other organization** = visible only to that organization's members
4. Choose files by clicking "Choose Files" or drag and drop files
5. Click "Upload Resources"

### Managing Resources
1. Use the search bar to find specific resources
2. Apply filters by category and organization
3. Select resources using checkboxes for bulk operations
4. Use the action buttons (View, Download, Delete) on each resource card

### Deleting Organizations & Categories
1. **Safety Checks**: The system prevents deletion of:
   - Organizations that have resources assigned to them
   - Global organizations (system-wide)
   - Categories that have resources assigned to them
   - The "General" category (default system category)
2. **Confirmation Modal**: A confirmation dialog appears before deletion
3. **Form Cleanup**: If a deleted item was selected in the upload form, it's automatically cleared

### Best Practices
- **Organizations**: Create logical groupings for your resources (e.g., departments, teams, projects)
- **Global Resources**: Use "Global Resources" organization for materials that should be accessible to all users
- **Categories**: Use descriptive category names for easy organization
- **Naming**: Use descriptive titles and descriptions for easy searching
- **File Management**: Regularly review and clean up unused resources
- **Deletion**: Only delete organizations and categories when you're certain they're no longer needed
- **Resource Cleanup**: Remove or reassign resources before deleting their associated organization or category

## Technical Details

### Frontend Components
- **Resources.jsx**: Main component for the Resources section
- **OrganizationModal**: Modal for creating/editing organizations
- **CategoryModal**: Modal for creating/editing categories
- **DeleteConfirmModal**: Modal for confirming deletions with safety checks
- **UI Components**: Uses shadcn/ui components for consistent styling
- **State Management**: React hooks for local state management
- **File Handling**: HTML5 File API for file selection and validation

### Data Structure
- **Organizations**: ID, name, type (global/organization)
- **Categories**: ID, name, color scheme
- **Resources**: ID, title, description, category, organization, visibility (auto-calculated)

### Visibility Logic
- **Automatic Calculation**: Visibility is determined by organization type
- **Global Resources**: `visibility = "global"` when organization type is "global"
- **Organization Resources**: `visibility = "organization"` for all other organizations
- **No User Input**: Users don't need to manage visibility separately

### Safety Mechanisms
- **Resource Association Check**: Prevents deletion of items with associated resources
- **System Item Protection**: Prevents deletion of global organizations and default categories
- **Confirmation Dialogs**: User must confirm before deletion
- **Form State Management**: Automatically clears form selections when items are deleted

### File Validation
- File type checking for images and videos
- File size validation (100MB limit)
- Multiple file support
- Drag and drop functionality

### Responsive Design
- Mobile-friendly interface
- Grid layout that adapts to screen size
- Touch-friendly controls

## Backend Integration Points

### Organizations API
- `GET /api/organizations` - Fetch all organizations
- `POST /api/organizations` - Create new organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization (with safety checks)

### Categories API
- `GET /api/categories` - Fetch all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category (with safety checks)

### Resources API
- `GET /api/resources` - Fetch resources with filters
- `POST /api/resources` - Upload new resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource
- `GET /api/resources/:id/download` - Download resource

### File Storage
- Support for image and video file uploads
- File metadata storage (name, size, type, upload date)
- Thumbnail generation for images
- Secure file access control based on organization type

## Future Enhancements
- **Advanced Metadata**: Custom fields and tags for resources
- **Resource Sharing**: Share resources between organizations
- **Version Control**: Track changes and versions of resources
- **Access Control**: Granular permissions for different user roles
- **Resource Analytics**: Usage statistics and insights
- **Integration**: Connect with course modules and lessons
- **Bulk Import**: Import multiple resources at once
- **Resource Templates**: Predefined resource structures
- **Soft Delete**: Option to archive instead of permanently delete
- **Audit Trail**: Track all changes and deletions

## Access Control
- Only accessible to instructors and administrators
- Role-based permissions enforced through AuthContext
- Organization-based access control for resources
- Automatic visibility based on organization selection
- Secure file handling and validation

## Security Considerations
- File type validation to prevent malicious uploads
- File size limits to prevent abuse
- Organization isolation for sensitive resources
- User authentication and authorization checks
- Secure file storage and access control
- Confirmation dialogs for destructive actions
- Safety checks before deletion operations
