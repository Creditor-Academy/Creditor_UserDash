import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Edit,
  Trash2,
  Plus,
  X,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';

const AddUpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  /* ================= STATUS LOGIC ================= */
  const getEventStatus = (event) => {
    if (!event.endDate) return 'active';
    return new Date(event.endDate) >= new Date()
      ? 'active'
      : 'inactive';
  };

  /* ================= FILTER ================= */
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const status = getEventStatus(event);
    const matchesFilter =
      activeFilter === 'all' || status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  /* ================= IMAGE UPLOAD ================= */
  const handleBannerUpload = (file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setBannerPreview(preview);
    setEditingEvent((prev) => ({ ...prev, banner: preview }));
  };

  /* ================= SAVE ================= */
  const handleSave = () => {
    if (
      !editingEvent.title ||
      !editingEvent.startDate ||
      !editingEvent.endDate ||
      !editingEvent.banner
    ) {
      alert('Please fill all fields and upload banner image');
      return;
    }

    if (editingEvent.id) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id ? editingEvent : e
        )
      );
    } else {
      setEvents((prev) => [
        ...prev,
        { ...editingEvent, id: Date.now() },
      ]);
    }

    setIsModalOpen(false);
    setEditingEvent(null);
    setBannerPreview(null);
  };

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Add Upcoming Events Banner
          </h1>
          <p className="text-gray-600">Manage upcoming event banners</p>
        </div>

        <button
          onClick={() => {
            setEditingEvent({
              title: '',
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
          Add Banner
        </button>
      </div>

      {/* SEARCH + FILTER (ONLY IF EVENTS EXIST) */}
      {events.length > 0 && (
        <div className="bg-white p-4 rounded-xl border shadow mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-lg border capitalize transition ${
                  activeFilter === f
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {filteredEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600 text-lg font-medium">
            No items available
          </p>
          <p className="text-gray-400 text-sm">
            Add a banner or change your filters
          </p>
        </div>
      )}

      {/* CARD GRID */}
      {filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);

            return (
              <div
                key={event.id}
                className="group bg-white border rounded-xl shadow hover:shadow-xl overflow-hidden"
              >
                {/* IMAGE */}
                <div className="relative h-44">
                  <img
                    src={event.banner}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />

                  {/* ACTIONS */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setBannerPreview(event.banner);
                        setIsModalOpen(true);
                      }}
                      className="p-2 bg-white rounded-full shadow"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 bg-white rounded-full shadow text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3 className="font-bold text-lg">{event.title}</h3>

                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                    <Calendar size={12} />
                    {event.startDate} → {event.endDate}
                  </div>

                  <div className="mt-3">
                    {status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        <CheckCircle size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        <XCircle size={12} /> Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL (UNCHANGED) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingEvent?.id ? 'Edit Event Banner' : 'Add Event Banner'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Event Title"
                value={editingEvent?.title || ''}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, title: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="date"
                value={editingEvent?.startDate || ''}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, startDate: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <label className="text-sm text-gray-500">Start Date</label>

              <input
                type="date"
                value={editingEvent?.endDate || ''}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, endDate: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <label className="text-sm text-gray-500">End Date</label>

              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-[#6164ec]">
                <ImageIcon className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  Click to upload banner image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleBannerUpload(e.target.files[0])}
                />
              </label>

              {bannerPreview && (
                <img
                  src={bannerPreview}
                  className="h-32 w-full object-cover rounded border"
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
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUpcomingEvents;

