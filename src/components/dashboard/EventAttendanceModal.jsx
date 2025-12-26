import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getAuthHeader } from '@/services/authHeader';
import { Button } from '@/components/ui/button';
import ExcelJS from 'exceljs';

const EventAttendanceModal = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventDate,
}) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!eventId || !isOpen) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/instructor/events/${eventId}/attendance`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeader(),
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }

        const data = await response.json();
        const raw = data?.data || {};
        const rawList = raw.eventAttendanceList || raw.eventAttendaceList || [];

        // Normalize attendee user fields and list name so rest of component works
        const normalizedList = Array.isArray(rawList)
          ? rawList.map(attendee => {
              const user = attendee.user || {};
              const name = user.name || '';
              const [firstFromName, ...restName] = name.split(' ');

              return {
                ...attendee,
                user: {
                  ...user,
                  first_name:
                    user.first_name || user.firstName || firstFromName || '',
                  last_name:
                    user.last_name || user.lastName || restName.join(' ') || '',
                },
              };
            })
          : [];

        setAttendanceData({
          ...raw,
          // keep both keys for compatibility
          eventAttendaceList: normalizedList,
          eventAttendanceList: normalizedList,
        });
      } catch (err) {
        setError(err.message);
        console.error('Error fetching attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [eventId, isOpen]);

  const filteredAttendees = attendanceData?.eventAttendaceList?.filter(
    attendee =>
      attendee.user.first_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      attendee.user.last_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      attendee.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportCSV = async () => {
    if (
      !attendanceData ||
      !eventTitle ||
      !eventDate ||
      !attendanceData.eventAttendaceList
    )
      return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Add title row
    worksheet.addRow(['Event Attendance Report']);
    worksheet.addRow(['Event:', eventTitle]);
    worksheet.addRow(['Date:', formatDate(eventDate)]);
    worksheet.addRow([]); // Empty row for spacing

    // Add headers
    worksheet.addRow(['Name', 'Email', 'Status', 'Time']);

    // Add data
    attendanceData.eventAttendaceList.forEach(attendee => {
      const attendanceTime = attendee.created_at
        ? new Date(attendee.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'UTC',
          })
        : 'N/A';

      worksheet.addRow([
        `${attendee.user.first_name} ${attendee.user.last_name}`,
        attendee.user.email,
        attendee.isPresent ? 'Present' : 'Absent',
        attendanceTime,
      ]);
    });

    // Style the header
    worksheet.getRow(1).font = { bold: true, size: 14 };
    worksheet.getRow(5).font = { bold: true };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 50;
    });

    // Generate the file
    const buffer = await workbook.csv.writeBuffer();
    const blob = new Blob([buffer], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date(eventDate).toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Event Attendance
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-shrink-0">
            <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900">
                {eventTitle}
              </h3>
              {eventDate && (
                <div className="flex items-center mt-2 text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm">{formatDate(eventDate)}</p>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-sm text-gray-600">
                Loading attendance data...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4 bg-red-50 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-red-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p className="text-xl text-blue-600 font-medium">
                        Total Attendees
                      </p>
                    </div>
                    <p className="text-4xl font-bold text-blue-700 pr-4">
                      {attendanceData?.eventAttendaceList?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>
                <Button
                  onClick={handleExportCSV}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 flex items-center gap-2"
                  disabled={
                    !attendanceData ||
                    !attendanceData.eventAttendaceList ||
                    attendanceData.eventAttendaceList.length === 0
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export CSV
                </Button>
              </div>

              <div
                className="overflow-y-auto rounded-lg border border-gray-200"
                style={{ maxHeight: 'calc(85vh - 380px)' }}
              >
                {filteredAttendees?.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredAttendees.map((attendee, index) => (
                      <div
                        key={index}
                        className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm">
                            {attendee.user.first_name[0]}
                            {attendee.user.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {attendee.user.first_name}{' '}
                              {attendee.user.last_name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              {attendee.user.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {attendee.created_at
                            ? new Date(attendee.created_at).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                  timeZone: 'UTC',
                                }
                              )
                            : 'Invalid Date'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-300 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="text-gray-500 text-center">
                      No attendance records found
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try adjusting your search terms
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventAttendanceModal;
