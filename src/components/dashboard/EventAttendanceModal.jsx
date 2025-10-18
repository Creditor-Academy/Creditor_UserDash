import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Download, 
  Calendar, 
  Clock, 
  UserCheck,
  UserX,
  Mail,
  User,
  RefreshCw
} from 'lucide-react';
import { getEventAttendance } from '../../services/attendanceService';
import { toast } from 'sonner';

const EventAttendanceModal = ({ 
  isOpen, 
  onClose, 
  eventId, 
  eventTitle = "Event Attendance",
  eventDate = null,
  eventTime = null 
}) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAttendance, setFilteredAttendance] = useState([]);

  // Fetch attendance data when modal opens
  useEffect(() => {
    if (isOpen && eventId) {
      fetchAttendanceData();
    }
  }, [isOpen, eventId]);

  // Filter attendance based on search term
  useEffect(() => {
    if (attendanceData?.eventAttendaceList) {
      const filtered = attendanceData.eventAttendaceList.filter(attendance => {
        const fullName = `${attendance.user.first_name} ${attendance.user.last_name}`.toLowerCase();
        const email = attendance.user.email.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
      setFilteredAttendance(filtered);
    }
  }, [attendanceData, searchTerm]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const data = await getEventAttendance(eventId);
      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error(error.message || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAttendanceData();
  };

  const handleExportCSV = () => {
    if (!attendanceData?.eventAttendaceList) return;

    const csvContent = [
      ['Name', 'Email', 'Attendance Status', 'Marked At'].join(','),
      ...attendanceData.eventAttendaceList.map(attendance => [
        `"${attendance.user.first_name} ${attendance.user.last_name}"`,
        `"${attendance.user.email}"`,
        attendance.isPresent ? 'Present' : 'Absent',
        new Date(attendance.createdAt || attendance.created_at).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendance data exported successfully');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-6 w-6 text-blue-600" />
            Event Attendance
          </DialogTitle>
        </DialogHeader>

        {/* Event Info Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{eventTitle}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                {eventDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(eventDate)}</span>
                  </div>
                )}
                {eventTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(eventTime)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={!attendanceData?.eventAttendaceList?.length}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {attendanceData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Present</p>
                    <p className="text-2xl font-bold text-green-600">
                      {attendanceData.TotalPresent || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Attendees</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {attendanceData.eventAttendaceList?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserX className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(attendanceData.eventAttendaceList?.length || 0) - (attendanceData.TotalPresent || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Attendance List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading attendance...</span>
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No matching attendees found' : 'No attendance recorded'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Attendance will appear here once students join the event'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAttendance.map((attendance, index) => (
                <Card key={attendance.id || index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          attendance.isPresent 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {attendance.isPresent ? (
                            <UserCheck className="h-5 w-5" />
                          ) : (
                            <UserX className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {attendance.user.first_name} {attendance.user.last_name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span>{attendance.user.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={attendance.isPresent ? "default" : "destructive"}
                          className={attendance.isPresent 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        >
                          {attendance.isPresent ? 'Present' : 'Absent'}
                        </Badge>
                        {attendance.createdAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(attendance.createdAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventAttendanceModal;
