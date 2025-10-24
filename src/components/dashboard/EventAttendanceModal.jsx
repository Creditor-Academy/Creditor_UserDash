import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getAuthHeader } from "@/services/authHeader";
import { Button } from "@/components/ui/button";
import ExcelJS from 'exceljs';

const EventAttendanceModal = ({ isOpen, onClose, eventId, eventTitle, eventDate }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch attendance data");
        }

        const data = await response.json();
        setAttendanceData(data.data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [eventId, isOpen]);

  const filteredAttendees = attendanceData?.eventAttendaceList?.filter(attendee =>
    attendee.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
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
    if (!attendanceData || !eventTitle || !eventDate) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Add title row
    worksheet.addRow(['Event Attendance Report']);
    worksheet.addRow(['Event:', eventTitle]);
    worksheet.addRow(['Date:', formatDate(eventDate)]);
    worksheet.addRow([]);  // Empty row for spacing

    // Add headers
    worksheet.addRow(['Name', 'Email', 'Status']);

    // Add data
    attendanceData.eventAttendaceList.forEach(attendee => {
      worksheet.addRow([
        `${attendee.user.first_name} ${attendee.user.last_name}`,
        attendee.user.email,
        attendee.isPresent ? 'Present' : 'Absent'
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Event Attendance
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-6">
            <h3 className="font-medium text-gray-900">{eventTitle}</h3>
            {eventDate && (
              <p className="text-sm text-gray-500">{formatDate(eventDate)}</p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total Present</p>
                  <p className="text-2xl font-bold text-green-700">
                    {attendanceData?.TotalPresent || 0}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Attendees</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {attendanceData?.eventAttendaceList?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleExportCSV}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!attendanceData || attendanceData.eventAttendaceList.length === 0}
                >
                  Export CSV
                </Button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {filteredAttendees?.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredAttendees.map((attendee, index) => (
                      <div key={index} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">
                            {attendee.user.first_name} {attendee.user.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{attendee.user.email}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          attendee.isPresent
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attendee.isPresent ? 'Present' : 'Absent'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records found
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