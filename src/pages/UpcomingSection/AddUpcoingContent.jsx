import React, { useState } from 'react';
import {
  BookOpen,
  Image as ImageIcon,
  Clock,
  Zap,
  Edit,
  Trash2,
  Plus,
  X,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const AddUpcoingContent = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 🔥 NEW
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  /* ================= STATUS LOGIC ================= */
  const getStatus = (course) => {
    if (!course.endDate) return 'active';
    return new Date(course.endDate) >= new Date()
      ? 'active'
      : 'inactive';
  };

  /* ================= FILTER ================= */
  const filteredCourses = courses.filter((course) => {
    const matchSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase());

    const status = getStatus(course);
    const matchStatus =
      statusFilter === 'all' || status === statusFilter;

    return matchSearch && matchStatus;
  });

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = (file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setBannerPreview(preview);
    setEditingCourse((prev) => ({ ...prev, banner: preview }));
  };

  /* ================= SAVE ================= */
  const handleSave = () => {
    if (
      !editingCourse.title ||
      !editingCourse.category ||
      !editingCourse.startDate ||
      !editingCourse.endDate ||
      !editingCourse.banner
    ) {
      alert('Please fill all fields and upload image');
      return;
    }

    if (editingCourse.id) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id ? editingCourse : c
        )
      );
    } else {
      setCourses((prev) => [
        ...prev,
        { ...editingCourse, id: Date.now() },
      ]);
    }

    setIsModalOpen(false);
    setEditingCourse(null);
    setBannerPreview(null);
  };

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Add Upcoming Content
          </h1>
          <p className="text-gray-600">
            Manage upcoming content banners
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCourse({
              title: '',
              category: '',
              startDate: '',
              endDate: '',
              banner: null,
            });
            setBannerPreview(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#6164ec] hover:bg-[#4f52d8] text-white px-5 py-2.5 rounded-lg"
        >
          <Plus size={18} />
          Add Content
        </button>
      </div>

      {/* SEARCH + FILTER */}
      {courses.length > 0 && (
        <div className="bg-white p-4 rounded-xl border shadow mb-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg border text-sm capitalize transition ${
                  statusFilter === status
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {courses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-500 text-lg font-medium">
            No content available
          </p>
          <p className="text-gray-400 text-sm">
            Click “Add Content” to create your first upcoming content
          </p>
        </div>
      )}

      {/* CARD GRID */}
      {filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const status = getStatus(course);

            return (
              <div
                key={course.id}
                className="group bg-white rounded-xl overflow-hidden border shadow hover:shadow-xl transition"
              >
                {/* IMAGE */}
                <div className="relative h-40">
                  <img
                    src={course.banner}
                    alt="Content"
                    className="w-full h-full object-cover"
                  />

                  {/* STATUS BADGE */}
                  <div className="absolute top-3 left-3">
                    {status === 'active' ? (
                      <span className="px-2.5 py-1 text-xs rounded-full bg-white/90 text-green-700 flex items-center gap-1">
                        <CheckCircle size={12} /> Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs rounded-full bg-white/90 text-red-600 flex items-center gap-1">
                        <XCircle size={12} /> Inactive
                      </span>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        setEditingCourse(course);
                        setBannerPreview(course.banner);
                        setIsModalOpen(true);
                      }}
                      className="p-2 bg-white rounded-full shadow"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-2 bg-white rounded-full shadow text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {course.title}
                  </h3>

                  <span className="inline-flex items-center text-xs text-gray-600">
                    <BookOpen className="h-3 w-3 mr-1.5" />
                    {course.category}
                  </span>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <Calendar size={12} />
                    {course.startDate} → {course.endDate}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 border-t pt-2 mt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Upcoming
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-400" />
                      New Content
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL (UNCHANGED) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 ">
          <div className="bg-white w-full max-w-md rounded-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingCourse?.id ? 'Edit Content' : 'Add Content'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Content Title"
                value={editingCourse?.title || ''}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, title: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              <select
                value={editingCourse?.category || ''}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    category: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded bg-white"
              >
                <option value="">Select category</option>
                <option value="Lesson">Lesson</option>
                <option value="Module">Module</option>
                <option value="Course">Course</option>
              </select>


              <input
                type="date"
                value={editingCourse?.startDate || ''}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    startDate: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <label className="text-sm text-gray-500">Start Date</label>


              <input
                type="date"
                value={editingCourse?.endDate || ''}
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    endDate: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <label className="text-sm text-gray-500">End Date</label>

              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-[#6164ec]">
                <ImageIcon className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  Click to upload image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                />
              </label>

              {bannerPreview && (
                <img
                  src={bannerPreview}
                  className="h-32 w-full object-contain rounded border"
                  alt="Preview"
                />
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button
                onClick={handleSave}
                className="bg-[#6164ec] text-white px-4 py-2 rounded"
              >
                Save Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUpcoingContent;
