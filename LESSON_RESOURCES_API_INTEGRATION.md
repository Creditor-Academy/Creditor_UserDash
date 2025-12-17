# Lesson Resources API Integration

## Backend API Endpoints

All endpoints are prefixed with: `/api/lesson/:lessonid/external-lesson-resources/`

1. **POST** `/:lessonid/external-lesson-resources/add` - Upload resource
2. **GET** `/:lessonid/external-lesson-resources/view-all` - Get all resources
3. **PUT** `/:lessonid/external-lesson-resources/:resourceid/edit` - Edit resource
4. **DELETE** `/:lessonid/external-lesson-resources/:resourceid/delete` - Delete resource

## Request/Response Format

### Upload Resource (POST)

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- File Field Name: `lesson-resource` (required)
- Body Fields:
  - `title` (string, max 200 chars, required)
  - `description` (string, optional)
  - `resource_type` (enum: IMAGE, VIDEO, TEXT_FILE, PDF, required)
- File Size Limit: 1GB

**Response:**

```json
{
  "data": {
    "id": "resource_id",
    "title": "Resource Title",
    "description": "Description",
    "url": "https://s3-url.com/...",
    "resource_type": "PDF",
    "lesson_id": "lesson_id",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Resources (GET)

**Response:**

```json
{
  "data": [
    {
      "id": "resource_id",
      "title": "Resource Title",
      "description": "Description",
      "url": "https://s3-url.com/...",
      "resource_type": "PDF",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Edit Resource (PUT)

**Request:**

- Method: `PUT`
- Content-Type: `application/json`
- Body:

```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "resource_type": "PDF"
}
```

### Delete Resource (DELETE)

**Request:**

- Method: `DELETE`
- No body required

## Frontend Implementation

### Files Modified:

1. **`src/services/lessonResourceService.js`**
   - `getLessonResources(lessonId)` - Fetches all resources
   - `uploadLessonResource(lessonId, file, metadata)` - Uploads file with metadata
   - `updateLessonResource(lessonId, resourceId, updates)` - Updates resource metadata
   - `deleteLessonResource(lessonId, resourceId)` - Deletes resource
   - Auto-detects resource_type from file MIME type

2. **`src/pages/LessonResourcesPage.jsx`** (User View)
   - Displays all resources for a lesson
   - Download/view resource functionality
   - Shows resource type badges (Image, Video, PDF, Document)
   - Handles backend response format

3. **`src/pages/ModuleLessonsView.jsx`** (Instructor Portal)
   - "Upload Resources" button on each lesson card
   - Upload dialog with:
     - File selection (1GB limit)
     - Title input (required)
     - Description textarea (optional)
     - Auto-detected resource type
   - View existing resources with delete functionality
   - Real-time resource management

## Resource Type Mapping

| Backend Value | Display Label | Icon     |
| ------------- | ------------- | -------- |
| IMAGE         | Image         | 📷 Image |
| VIDEO         | Video         | 🎥 Video |
| PDF           | PDF           | 📄 PDF   |
| TEXT_FILE     | Document      | 📁 File  |

## Features Implemented

### User Features (LessonResourcesPage):

- ✅ View all resources for a lesson
- ✅ Download/open resources in new tab
- ✅ Visual file type indicators
- ✅ Resource metadata display (title, description, date)
- ✅ Error handling for missing resources

### Instructor Features (ModuleLessonsView):

- ✅ Upload resources button on lesson cards
- ✅ File upload with validation (1GB limit)
- ✅ Title and description fields
- ✅ Automatic resource type detection
- ✅ View all uploaded resources
- ✅ Delete resources
- ✅ Real-time resource list updates
- ✅ Loading states and progress indicators

## Authentication & Authorization

- All requests include authentication headers via `getAuthHeader()`
- Requests are sent with `withCredentials: true`
- Organization ID is automatically sent from user context (backend requirement)

## Error Handling

All API calls include comprehensive error handling:

- Network errors
- Validation errors from backend
- File size/type validation on frontend
- User-friendly toast notifications
- Graceful fallbacks for empty states

## Testing Checklist

- [ ] Upload different file types (images, videos, PDFs, documents)
- [ ] Upload files near 1GB limit
- [ ] Verify resource type is correctly detected
- [ ] Test download/view functionality
- [ ] Test delete functionality
- [ ] Verify resources persist across page refreshes
- [ ] Test error scenarios (invalid files, network errors)
- [ ] Verify UI works on mobile devices
