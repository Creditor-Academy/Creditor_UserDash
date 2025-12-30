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
import { Search } from 'lucide-react';

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

        let raw = {};
        if (data?.code !== undefined && data?.data) {
          raw = data.data;
        } else if (data?.data) {
          raw = data.data;
        } else {
          raw = data || {};
        }

        const rawList = raw.eventAttendanceList || raw.eventAttendaceList || [];

        const normalizedList = Array.isArray(rawList)
          ? rawList.map(attendee => {
              const user = attendee.user || {};
              const name = user.name || '';
              const [firstFromName, ...restName] = name.split(' ');

              return {
                ...attendee,
                attendanceTime:
                  attendee.attendanceTime ||
                  attendee.attendance_time ||
                  attendee.time ||
                  '',
                user: {
                  ...user,
                  first_name:
                    user.first_name || user.firstName || firstFromName || '',
                  last_name:
                    user.last_name || user.lastName || restName.join(' ') || '',
                  email: user.email || '',
                },
              };
            })
          : [];

        setAttendanceData({
          ...raw,
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
    attendee => {
      if (!attendee || !attendee.user) return false;
      const user = attendee.user;
      const firstName = (user.first_name || '').toLowerCase();
      const lastName = (user.last_name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      return (
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        email.includes(searchLower)
      );
    }
  );

  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTimeOnly = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .toLowerCase();
  };

  const formatDateOnly = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleExportCSV = async () => {
    if (!attendanceData?.eventAttendanceList?.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    worksheet.addRow([
      'Event Title',
      'Attendance Date',
      'Attendance Time',
      'Name',
      'Email',
      'Status',
    ]);

    attendanceData.eventAttendanceList.forEach(attendee => {
      worksheet.addRow([
        eventTitle,
        attendee.attendanceDate ?? '',
        attendee.attendanceTime ?? '',
        `${attendee.user?.first_name ?? ''} ${attendee.user?.last_name ?? ''}`.trim(),
        attendee.user?.email ?? '',
        attendee.isPresent ? 'Present' : 'Absent',
      ]);
    });

    worksheet.columns.forEach(col => (col.width = 30));

    const buffer = await workbook.csv.writeBuffer();
    const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${eventTitle
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
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
              {/* Event Info Section */}
              <div className="flex-shrink-0 px-6 py-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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

              {/* Total Attendees Section */}
              <div className="px-6 py-4">
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

              {/* Search and Export Section */}
              <div className="flex gap-4 mb-6 px-6">
                <div className="relative flex-1">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                    !attendanceData.eventAttendanceList ||
                    attendanceData.eventAttendanceList.length === 0
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

              {/* Attendees List Section */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  {filteredAttendees?.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredAttendees.map((attendee, index) => (
                        <div
                          key={index}
                          className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          {/* Left section: User info */}
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm uppercase">
                              {attendee.user?.first_name?.[0] || ''}
                              {attendee.user?.last_name?.[0] || ''}
                            </div>

                            <div>
                              <p className="font-medium text-gray-900">
                                {attendee.user?.first_name || ''}{' '}
                                {attendee.user?.last_name || ''}
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
                                {attendee.user?.email || 'No email'}
                              </div>
                            </div>
                          </div>

                          {/* Right section: Attendance date & time */}
                          <div className="text-right text-sm text-gray-600">
                            {attendee.attendanceTime && (
                              <>
                                <p className="font-medium">
                                  {formatDateOnly(attendee.attendanceTime)}
                                </p>
                                <div className="flex items-center gap-1 justify-end">
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
                                  <span className="font-medium">
                                    {formatTimeOnly(attendee.attendanceTime)}
                                  </span>
                                </div>
                              </>
                            )}
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
                        {searchTerm
                          ? 'No attendees found matching your search.'
                          : 'No attendance records found'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm ? 'Try adjusting your search terms' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventAttendanceModal;
