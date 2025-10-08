import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { markAllNotificationsRead } from "@/services/notificationService";
import getSocket from "@/services/socketClient";
import { getInvitationByToken, acceptPrivateGroupInvitation, rejectPrivateGroupInvitation } from "@/services/privateGroupService";

export function NotificationModal({ open, onOpenChange, onNotificationUpdate, notificationsFromApi = [], onMarkedAllRead }) {
  const [notifications, setNotifications] = useState([]);
  const [chatInvites, setChatInvites] = useState([]);

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    courseUpdates: true,
    assignmentReminders: true,
    systemAnnouncements: true,
    groupActivities: false,
    paymentNotifications: true,
    paymentReminders: true,
    paymentDueAlerts: true,
  });

  // Load API notifications when provided
  useEffect(() => {
    if (Array.isArray(notificationsFromApi)) {
      const mapped = notificationsFromApi.map((n) => ({
        id: String(n.id ?? n._id ?? Math.random()),
        type: (n.type || 'info').toString().toLowerCase(),
        title: n.title || 'Notification',
        description: n.message || n.description || '',
        time: new Date(n.created_at || n.createdAt || Date.now()).toLocaleString(),
        color: n.read ? 'bg-gray-50' : 'bg-blue-50',
        dotColor: n.read ? 'bg-gray-300' : 'bg-blue-500',
        read: !!n.read,
      }));
      console.log('All notifications from API:', notificationsFromApi);
      console.log('Mapped notifications:', mapped);
      console.log('Read notifications count:', mapped.filter(n => n.read).length);
      console.log('Unread notifications count:', mapped.filter(n => !n.read).length);
      setNotifications(mapped);
    } else {
      setNotifications([]);
    }
  }, [notificationsFromApi]);

  // Initialize unread count when modal opens
  useEffect(() => {
    if (open && onNotificationUpdate) {
      const unreadCount = notifications.filter(n => !n.read).length + chatInvites.filter(c => !c.read).length;
      onNotificationUpdate(unreadCount);
    }
  }, [open, notifications, chatInvites, onNotificationUpdate]);

  // Socket listener for private group invitations
  useEffect(() => {
    const socket = getSocket();
    const currentUserId = String(localStorage.getItem('userId') || '');

    const onInvitationSent = async (data) => {
      try {
        const invites = Array.isArray(data?.invites) ? data.invites : [];
        const match = invites.find((i) => String(i.invitee_id) === currentUserId || String(i.inviteeId) === currentUserId);
        if (!match || !match.token) return;

        // Fetch invite details for rich card
        const detailRes = await getInvitationByToken(match.token);
        const detail = detailRes?.data || detailRes || {};
        const group = detail.group || {};
        const inviter = detail.inviter || {};

        const newInvite = {
          id: String(match.token),
          type: 'chat-invitation',
          title: group.name || 'Private Group',
          description: `You’ve been invited by ${[inviter.first_name, inviter.last_name].filter(Boolean).join(' ') || inviter.name || 'an admin'}`,
          time: new Date().toLocaleString(),
          token: match.token,
          groupId: group.id,
          thumbnail: group.thumbnail || group.image || null,
          inviterName: [inviter.first_name, inviter.last_name].filter(Boolean).join(' ') || inviter.name || 'Admin',
          read: false,
        };

        setChatInvites((prev) => {
          const exists = prev.some((c) => String(c.id) === String(newInvite.id));
          return exists ? prev : [newInvite, ...prev];
        });

        toast.info('New chat invitation received');
      } catch (e) {
        console.warn('Failed processing privateGroupInvitationSent', e);
      }
    };

    socket.on('privateGroupInvitationSent', onInvitationSent);
    return () => {
      socket.off('privateGroupInvitationSent', onInvitationSent);
    };
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    const newUnreadCount = notifications.filter(n => !n.read && n.id !== id).length;
    if (onNotificationUpdate) onNotificationUpdate(newUnreadCount);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
    } catch (e) {
      // If backend route isn't available, proceed with frontend-only update
      console.warn('Mark-all API failed or unavailable; applying frontend fallback.');
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setChatInvites(prev => prev.map(c => ({ ...c, read: true })));
    if (onMarkedAllRead) onMarkedAllRead();
    toast.success("All notifications marked as read");
    if (onNotificationUpdate) onNotificationUpdate(0);
  };

  const acceptInvite = async (token, idToRemove) => {
    try {
      await acceptPrivateGroupInvitation(token);
      toast.success('You joined the group successfully.');
      setChatInvites(prev => prev.filter(c => String(c.id) !== String(idToRemove)));
      // Optional navigation to messages view (adjust if you have a different route)
      // window.location.href = `/messages`;
    } catch (e) {
      console.warn('Accept invitation failed', e);
      toast.error(e?.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const rejectInvite = async (token, idToRemove) => {
    try {
      await rejectPrivateGroupInvitation(token);
      toast.success('Invitation rejected.');
      setChatInvites(prev => prev.filter(c => String(c.id) !== String(idToRemove)));
    } catch (e) {
      console.warn('Reject invitation failed', e);
      toast.error(e?.response?.data?.message || 'Failed to reject invitation');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] sm:w-[28rem] p-0 bg-white rounded-xl shadow-lg max-h-[90vh] h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-4 pb-0 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Bell className="h-4 w-4 text-gray-700" />
            Notifications
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="all" className="w-full flex flex-col flex-1 min-h-0">
          <div className="px-4 pb-2 border-b border-gray-100 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-5 h-8 bg-gray-100 rounded-lg p-1">
              <TabsTrigger 
                value="all" 
                className="text-xs font-medium rounded-md px-2 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="unread" 
                className="text-xs font-medium rounded-md px-2 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                Unread
              </TabsTrigger>
              <TabsTrigger 
                value="payment" 
                className="text-xs font-medium rounded-md px-2 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                Payment
              </TabsTrigger>
              <TabsTrigger 
                value="chats" 
                className="text-xs font-medium rounded-md px-2 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                Chats
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="text-xs font-medium rounded-md px-2 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
            <TabsContent value="all" className="space-y-2 mt-0">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500 text-xs">No notifications yet</p>
                </div>
              ) : (
                <>
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mb-2">
                    Total: {notifications.length} | 
                    Unread: {notifications.filter(n => !n.read).length} | 
                    Read: {notifications.filter(n => n.read).length}
                  </div>
                  
                  {/* Show all notifications - both read and unread */}
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${notification.color} border border-gray-100 ${notification.read ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full ${notification.dotColor} mt-1.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs">
                            {notification.title}
                            {notification.read && <span className="ml-2 text-gray-400 text-xs">(Read)</span>}
                          </h4>
                          <p className="text-gray-700 text-xs mt-1">
                            {notification.description}
                          </p>
                          <p className="text-blue-600 text-xs mt-1.5">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                          </Button>
                        ) : (
                          <div className="h-5 w-5 flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-gray-300"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="unread" className="space-y-2 mt-0">
              {notifications.filter(n => !n.read).length > 0 ? (
                notifications
                  .filter(n => !n.read)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${notification.color} border border-gray-100`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full ${notification.dotColor} mt-1.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs">
                            {notification.title}
                          </h4>
                          <p className="text-gray-700 text-xs mt-1">
                            {notification.description}
                          </p>
                          <p className="text-blue-600 text-xs mt-1.5">
                            {notification.time}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                        </Button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 text-xs">No unread notifications</p>
                </div>
              )}
              
            </TabsContent>

            <TabsContent value="payment" className="space-y-2 mt-0">
              {notifications.filter(n => n.type === 'payment').length > 0 ? (
                notifications
                  .filter(n => n.type === 'payment')
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${notification.color} border border-gray-100 ${notification.read ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full ${notification.dotColor} mt-1.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs">
                            {notification.title}
                          </h4>
                          <p className="text-gray-700 text-xs mt-1">
                            {notification.description}
                          </p>
                          <p className="text-blue-600 text-xs mt-1.5">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 text-xs">No payment notifications</p>
                </div>
              )}

            </TabsContent>

            {/* Chats tab - private group invitations */}
            <TabsContent value="chats" className="space-y-2 mt-0">
              {chatInvites.length > 0 ? (
                chatInvites.map((c) => (
                  <div key={c.id} className={`p-3 rounded-lg ${c.read ? 'bg-gray-50' : 'bg-blue-50'} border border-gray-100`}>
                    <div className="flex items-start gap-3">
                      {c.thumbnail ? (
                        <img src={c.thumbnail} alt={c.title} className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-xs">{c.title}</h4>
                        <p className="text-gray-700 text-xs mt-1">You’ve been invited to join {c.title} by {c.inviterName}</p>
                        <p className="text-blue-600 text-[10px] mt-1">{c.time}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => acceptInvite(c.token, c.id)} variant="default" className="h-6 px-2 py-1 text-xs">Accept</Button>
                        <Button onClick={() => rejectInvite(c.token, c.id)} variant="outline" className="h-6 px-2 py-1 text-xs">Reject</Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 text-xs">No chat notifications yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-3 mt-0">
              <h4 className="font-medium text-gray-900 text-sm">Notification Settings</h4>
              <Separator />
              
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-900">Notification Methods</h5>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="flex flex-col">
                    <span className="text-xs text-gray-900">Email Notifications</span>
                    <span className="text-xs text-gray-500">Receive notifications via email</span>
                  </Label>
                  <Switch 
                    id="email-notifications" 
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({...notificationSettings, email: checked});
                      toast.success("Email notification settings updated");
                    }}
                    className="scale-75"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications" className="flex flex-col">
                    <span className="text-xs text-gray-900">Push Notifications</span>
                    <span className="text-xs text-gray-500">Receive push notifications in-app</span>
                  </Label>
                  <Switch 
                    id="push-notifications" 
                    checked={notificationSettings.push}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({...notificationSettings, push: checked});
                      toast.success("Push notification settings updated");
                    }}
                    className="scale-75"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-900">Notification Types</h5>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="course-updates" className="flex flex-col">
                    <span className="text-xs text-gray-900">Course Updates</span>
                    <span className="text-xs text-gray-500">New content, assignments, and feedback</span>
                  </Label>
                  <Switch 
                    id="course-updates" 
                    checked={notificationSettings.courseUpdates}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({...notificationSettings, courseUpdates: checked});
                      toast.success("Course update settings updated");
                    }}
                    className="scale-75"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="assignment-reminders" className="flex flex-col">
                    <span className="text-xs text-gray-900">Assignment Reminders</span>
                    <span className="text-xs text-gray-500">Deadlines and due date notifications</span>
                  </Label>
                  <Switch 
                    id="assignment-reminders" 
                    checked={notificationSettings.assignmentReminders}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({...notificationSettings, assignmentReminders: checked});
                      toast.success("Assignment reminder settings updated");
                    }}
                    className="scale-75"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="system-announcements" className="flex flex-col">
                    <span className="text-xs text-gray-900">System Announcements</span>
                    <span className="text-xs text-gray-500">Platform updates and maintenance notices</span>
                  </Label>
                  <Switch 
                    id="system-announcements" 
                    checked={notificationSettings.systemAnnouncements}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({...notificationSettings, systemAnnouncements: checked});
                      toast.success("System announcement settings updated");
                    }}
                    className="scale-75"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="group-activities" className="flex flex-col">
                    <span className="text-xs text-gray-900">Group Activities</span>
                    <span className="text-xs text-gray-500">Updates from groups and study circles</span>
                  </Label>
                  <Switch 
                    id="group-activities" 
                    checked={notificationSettings.groupActivities}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({...notificationSettings, groupActivities: checked});
                      toast.success("Group activity settings updated");
                    }}
                    className="scale-75"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-900">Payment Notifications</h5>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="payment-notifications" className="flex flex-col">
                      <span className="text-xs text-gray-900">Payment Notifications</span>
                      <span className="text-xs text-gray-500">Payment confirmations and receipts</span>
                    </Label>
                    <Switch
                      id="payment-notifications"
                      checked={notificationSettings.paymentNotifications}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, paymentNotifications: checked });
                        toast.success("Payment notification settings updated");
                      }}
                      className="scale-75"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="payment-reminders" className="flex flex-col">
                      <span className="text-xs text-gray-900">Payment Reminders</span>
                      <span className="text-xs text-gray-500">Upcoming payment notifications</span>
                    </Label>
                    <Switch
                      id="payment-reminders"
                      checked={notificationSettings.paymentReminders}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, paymentReminders: checked });
                        toast.success("Payment reminder settings updated");
                      }}
                      className="scale-75"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="payment-due-alerts" className="flex flex-col">
                      <span className="text-xs text-gray-900">Payment Due Alerts</span>
                      <span className="text-xs text-gray-500">Urgent payment due notifications</span>
                    </Label>
                    <Switch
                      id="payment-due-alerts"
                      checked={notificationSettings.paymentDueAlerts}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, paymentDueAlerts: checked });
                        toast.success("Payment due alert settings updated");
                      }}
                      className="scale-75"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          {/* Fixed Mark All as Read button at bottom */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
            <Button
              variant="outline"
              className="w-full h-8 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default NotificationModal;