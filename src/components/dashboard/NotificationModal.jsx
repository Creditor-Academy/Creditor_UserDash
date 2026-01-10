import React, { useState, useEffect, useContext } from "react";
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
import {
  getInvitationByToken,
  acceptPrivateGroupInvitation,
  rejectPrivateGroupInvitation,
  getPendingInvitations,
} from "@/services/privateGroupService";
import { SeasonalThemeContext } from "@/contexts/SeasonalThemeContext";

export function NotificationModal({
  open,
  onOpenChange,
  onNotificationUpdate,
  notificationsFromApi = [],
  onMarkedAllRead,
}) {
  const { activeTheme } = useContext(SeasonalThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [chatInvites, setChatInvites] = useState([]);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

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
      const mapped = notificationsFromApi.map((n) => {
        // Handle different field name variations for event notifications
        const notificationType = (
          n.type ||
          n.related_type ||
          n.notification_type ||
          "info"
        )
          .toString()
          .toLowerCase();
        const notificationTitle = n.title || n.subject || "Notification";
        const notificationMessage =
          n.message || n.description || n.body || n.content || "";
        const notificationId = String(
          n.id ?? n._id ?? `notif-${Date.now()}-${Math.random()}`,
        );
        const createdAt =
          n.created_at ||
          n.createdAt ||
          n.timestamp ||
          n.date ||
          new Date().toISOString();
        const isRead = n.read !== undefined ? !!n.read : false;

        return {
          id: notificationId,
          type: notificationType,
          title: notificationTitle,
          description: notificationMessage,
          time: new Date(createdAt).toLocaleString(),
          color: isRead ? "bg-gray-50" : "bg-blue-50",
          dotColor: isRead ? "bg-gray-300" : "bg-blue-500",
          read: isRead,
          // Preserve original notification data for reference
          original: n,
        };
      });
      console.log("All notifications from API:", notificationsFromApi);
      console.log("Mapped notifications:", mapped);
      console.log(
        "Read notifications count:",
        mapped.filter((n) => n.read).length,
      );
      console.log(
        "Unread notifications count:",
        mapped.filter((n) => !n.read).length,
      );
      setNotifications(mapped);
    } else {
      setNotifications([]);
    }
  }, [notificationsFromApi]);

  // Load pending invitations when component mounts or modal opens
  useEffect(() => {
    // Load on mount to update notification badge
    loadPendingInvitations();
  }, []);

  // Also load when modal opens to ensure fresh data
  useEffect(() => {
    if (open) {
      loadPendingInvitations();
    }
  }, [open]);

  // Load invitations on user login
  useEffect(() => {
    const handleUserLoggedIn = () => {
      console.log("User logged in - loading pending invitations");
      setTimeout(() => {
        loadPendingInvitations();
      }, 500); // Small delay to ensure token is set
    };

    window.addEventListener("userLoggedIn", handleUserLoggedIn);
    return () => window.removeEventListener("userLoggedIn", handleUserLoggedIn);
  }, []);

  // Listen for invitation refresh requests
  useEffect(() => {
    const handleRefresh = () => {
      console.log("Invitation refresh requested");
      loadPendingInvitations();
    };

    window.addEventListener("refresh-invitations", handleRefresh);
    return () =>
      window.removeEventListener("refresh-invitations", handleRefresh);
  }, []);

  const loadPendingInvitations = async () => {
    try {
      console.log(
        "[Invitation API] Fetching pending invitations for current user...",
      );
      const response = await getPendingInvitations();

      // Handle nested response structure from backend
      // Backend returns: { success: true, data: [...] }
      // Axios wraps it: { data: { success: true, data: [...] } }
      const invitations =
        response?.data?.data ||
        response?.data?.invitations ||
        response?.data ||
        [];

      console.log("[Invitation API] Full response:", response);
      console.log("[Invitation API] Response.data:", response?.data);
      console.log("[Invitation API] Parsed invitations:", invitations);
      console.log(
        "[Invitation API] Current user ID:",
        localStorage.getItem("userId"),
      );

      if (!Array.isArray(invitations) || invitations.length === 0) {
        console.log("[Invitation API] No pending invitations found");
        return;
      }

      console.log(
        "[Invitation API] Processing",
        invitations.length,
        "invitations",
      );

      // Map invitations to the format expected by the UI
      const currentUserId = localStorage.getItem("userId");
      const mappedInvites = await Promise.all(
        invitations.map(async (inv) => {
          try {
            // Double-check this invitation is for the current user
            const inviteeId = String(inv.invitee_id || inv.inviteeId || "");
            if (inviteeId && inviteeId !== String(currentUserId)) {
              console.log(
                "[Invitation API] Skipping invitation not for current user:",
                inv,
              );
              return null;
            }

            // Fetch full invitation details if needed
            const detailRes = inv.group
              ? { data: inv }
              : await getInvitationByToken(inv.token);
            const detail = detailRes?.data || detailRes || {};
            const group = detail.group || {};
            const inviter = detail.inviter || {};

            return {
              id: String(inv.token || inv.id),
              type: "chat-invitation",
              title: group.name || inv.group_name || "Private Group",
              description: `You've been invited by ${[inviter.first_name, inviter.last_name].filter(Boolean).join(" ") || inviter.name || "an admin"}`,
              time: new Date(
                inv.created_at || inv.createdAt || Date.now(),
              ).toLocaleString(),
              token: inv.token,
              groupId: group.id || inv.group_id,
              thumbnail: group.thumbnail || group.image || null,
              inviterName:
                [inviter.first_name, inviter.last_name]
                  .filter(Boolean)
                  .join(" ") ||
                inviter.name ||
                "Admin",
              read: false,
            };
          } catch (err) {
            console.warn("Failed to process invitation:", err);
            return null;
          }
        }),
      );

      // Filter out any null values and update state
      const validInvites = mappedInvites.filter(Boolean);

      // Deduplicate invitations by group - only keep the most recent invitation per group
      const deduplicatedInvites = [];
      const seenGroups = new Set();

      // Sort by time (newest first) and keep only the first invitation per group
      validInvites
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .forEach((inv) => {
          const groupKey = String(inv.groupId);
          if (!seenGroups.has(groupKey)) {
            seenGroups.add(groupKey);
            deduplicatedInvites.push(inv);
          } else {
            console.log(
              "[Invitation API] Skipping duplicate invitation for group:",
              groupKey,
            );
          }
        });

      setChatInvites((prev) => {
        // Merge with existing invites, avoiding duplicates by token
        const existingTokens = new Set(prev.map((c) => String(c.token)));
        const newInvites = deduplicatedInvites.filter(
          (inv) => !existingTokens.has(String(inv.token)),
        );
        const updatedInvites = [...prev, ...newInvites];

        // Update parent badge count immediately
        if (onNotificationUpdate && newInvites.length > 0) {
          const totalUnread =
            notifications.filter((n) => !n.read).length +
            updatedInvites.filter((c) => !c.read).length;
          onNotificationUpdate(totalUnread);
        }

        return updatedInvites;
      });
    } catch (error) {
      console.error("Failed to load pending invitations:", error);
    }
  };

  // Initialize unread count when modal opens
  useEffect(() => {
    if (open && onNotificationUpdate) {
      const unreadCount =
        notifications.filter((n) => !n.read).length +
        chatInvites.filter((c) => !c.read).length;
      onNotificationUpdate(unreadCount);
    }
  }, [open, notifications, chatInvites, onNotificationUpdate]);

  // Socket listener for private group invitations
  useEffect(() => {
    const socket = getSocket();
    const currentUserId = String(localStorage.getItem("userId") || "");

    const onInvitationSent = async (data) => {
      try {
        console.log("[Invitation] Received socket event:", data);
        console.log("[Invitation] Current user ID:", currentUserId);

        const invites = Array.isArray(data?.invites) ? data.invites : [];

        console.log("[Invitation] Processing invites:", invites);
        console.log("[Invitation] Number of invites:", invites.length);

        // Check if current user is in the invitee list
        const match = invites.find((i) => {
          const inviteeId = String(i.invitee_id || i.inviteeId || "");
          const isMatch = inviteeId === currentUserId;
          console.log(
            "[Invitation] Checking invitee:",
            inviteeId,
            "against current:",
            currentUserId,
            "-> Match:",
            isMatch,
          );
          return isMatch;
        });

        // Only process if current user is actually invited (in the invitee list)
        if (!match || !match.token) {
          console.log(
            "[Invitation] Current user is NOT in invitee list - ignoring invitation",
          );
          return;
        }

        console.log(
          "[Invitation] Match found! Current user IS invited - Processing token:",
          match.token,
        );

        // Fetch invite details for rich card
        const detailRes = await getInvitationByToken(match.token);
        const detail = detailRes?.data || detailRes || {};
        const group = detail.group || {};
        const inviter = detail.inviter || {};

        const newInvite = {
          id: String(match.token),
          type: "chat-invitation",
          title: group.name || "Private Group",
          description: `You've been invited by ${[inviter.first_name, inviter.last_name].filter(Boolean).join(" ") || inviter.name || "an admin"}`,
          time: new Date().toLocaleString(),
          token: match.token,
          groupId: group.id,
          thumbnail: group.thumbnail || group.image || null,
          inviterName:
            [inviter.first_name, inviter.last_name].filter(Boolean).join(" ") ||
            inviter.name ||
            "Admin",
          read: false,
        };

        setChatInvites((prev) => {
          // Check if invitation with same token already exists
          const exists = prev.some(
            (c) =>
              String(c.id) === String(newInvite.id) ||
              String(c.token) === String(newInvite.token),
          );
          if (exists) {
            console.log("[Invitation] Invitation already exists - skipping");
            return prev;
          }

          // Check if user already has an invitation for this group
          const hasInviteForGroup = prev.some(
            (c) => String(c.groupId) === String(newInvite.groupId),
          );
          if (hasInviteForGroup) {
            console.log(
              "[Invitation] User already has invitation for this group - replacing with newer one",
            );
            // Remove old invitation for this group and add the new one
            const filtered = prev.filter(
              (c) => String(c.groupId) !== String(newInvite.groupId),
            );
            return [newInvite, ...filtered];
          }

          console.log("[Invitation] Adding new invitation to list");

          // Update notification badge
          if (onNotificationUpdate) {
            setTimeout(() => {
              const totalUnread =
                notifications.filter((n) => !n.read).length + (prev.length + 1);
              onNotificationUpdate(totalUnread);
            }, 100);
          }

          return [newInvite, ...prev];
        });

        toast.info("New chat invitation received");
      } catch (e) {
        console.warn(
          "[Invitation] Failed processing privateGroupInvitationSent",
          e,
        );
      }
    };

    socket.on("privateGroupInvitationSent", onInvitationSent);
    return () => {
      socket.off("privateGroupInvitationSent", onInvitationSent);
    };
  }, []);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    const newUnreadCount = notifications.filter(
      (n) => !n.read && n.id !== id,
    ).length;
    if (onNotificationUpdate) onNotificationUpdate(newUnreadCount);
  };

  const handleMarkAllAsRead = async () => {
    if (isMarkingAllRead) return; // Prevent multiple simultaneous calls

    setIsMarkingAllRead(true);

    try {
      console.log("Calling mark all as read API...");
      const response = await markAllNotificationsRead();
      console.log("Mark all as read API response:", response);

      // Update local state after successful API call
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setChatInvites((prev) => prev.map((c) => ({ ...c, read: true })));

      if (onMarkedAllRead) onMarkedAllRead();
      if (onNotificationUpdate) onNotificationUpdate(0);

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);

      // Check if it's a network error or backend unavailable
      if (error.response) {
        // Backend responded with an error
        toast.error(
          error.response.data?.message ||
            "Failed to mark notifications as read",
        );
      } else if (error.request) {
        // Request made but no response received
        toast.error(
          "Unable to connect to server. Please check your connection.",
        );
      } else {
        // Something else happened
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const acceptInvite = async (token, idToRemove) => {
    try {
      // Get invitation details before removing from list
      const invite = chatInvites.find(
        (c) => String(c.id) === String(idToRemove),
      );

      const response = await acceptPrivateGroupInvitation(token);

      toast.success("You joined the group successfully.");

      // Remove ALL invitations for the same group (handles duplicate invitations)
      setChatInvites((prev) => {
        const filtered = prev.filter((c) => {
          // Remove the accepted invitation by token
          if (String(c.id) === String(idToRemove)) return false;
          // Also remove any other invitations for the same group
          if (String(c.groupId) === String(invite?.groupId)) {
            console.log(
              "[Invitation] Removing duplicate invitation for same group:",
              c.id,
            );
            return false;
          }
          return true;
        });

        // Update notification badge
        if (onNotificationUpdate) {
          const totalUnread =
            notifications.filter((n) => !n.read).length +
            filtered.filter((c) => !c.read).length;
          onNotificationUpdate(totalUnread);
        }

        return filtered;
      });

      // Emit socket event for real-time updates
      const socket = getSocket();
      const currentUserId = localStorage.getItem("userId");
      socket.emit("privateGroupInvitationAccepted", {
        groupId: invite?.groupId,
        userId: currentUserId,
        token: token,
        group: {
          id: invite?.groupId,
          name: invite?.title,
          thumbnail: invite?.thumbnail,
          member_count: response?.data?.member_count || 1,
          description: response?.data?.description,
        },
      });

      // Dispatch custom event for local UI update
      window.dispatchEvent(
        new CustomEvent("privateGroupInvitationAccepted", {
          detail: {
            groupId: invite?.groupId,
            userId: currentUserId,
            group: {
              id: invite?.groupId,
              name: invite?.title,
              thumbnail: invite?.thumbnail,
              member_count: response?.data?.member_count || 1,
              description: response?.data?.description,
            },
          },
        }),
      );

      // Optional navigation to messages view (adjust if you have a different route)
      // window.location.href = `/messages`;
    } catch (e) {
      console.warn("Accept invitation failed", e);
      const errorMessage = e?.response?.data?.message || "";

      // Check if user is already a member
      if (
        errorMessage.toLowerCase().includes("already") ||
        errorMessage.toLowerCase().includes("member")
      ) {
        toast.info("You are already a member of this group");

        // Remove this invitation since it's no longer valid
        const invite = chatInvites.find(
          (c) => String(c.id) === String(idToRemove),
        );
        setChatInvites((prev) => {
          const filtered = prev.filter(
            (c) => String(c.groupId) !== String(invite?.groupId),
          );

          // Update notification badge
          if (onNotificationUpdate) {
            const totalUnread =
              notifications.filter((n) => !n.read).length +
              filtered.filter((c) => !c.read).length;
            onNotificationUpdate(totalUnread);
          }

          return filtered;
        });
      } else {
        toast.error(errorMessage || "Failed to accept invitation");
      }
    }
  };

  const rejectInvite = async (token, idToRemove) => {
    try {
      await rejectPrivateGroupInvitation(token);
      toast.success("Invitation rejected.");

      // Remove the rejected invitation and update badge
      setChatInvites((prev) => {
        const filtered = prev.filter(
          (c) => String(c.id) !== String(idToRemove),
        );

        // Update notification badge
        if (onNotificationUpdate) {
          const totalUnread =
            notifications.filter((n) => !n.read).length +
            filtered.filter((c) => !c.read).length;
          onNotificationUpdate(totalUnread);
        }

        return filtered;
      });
    } catch (e) {
      console.warn("Reject invitation failed", e);
      toast.error(e?.response?.data?.message || "Failed to reject invitation");
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

        <Tabs
          defaultValue="all"
          className="w-full flex flex-col flex-1 min-h-0"
        >
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
                    Total: {notifications.length} | Unread:{" "}
                    {notifications.filter((n) => !n.read).length} | Read:{" "}
                    {notifications.filter((n) => n.read).length}
                  </div>

                  {/* Show all notifications - both read and unread */}
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${notification.color} border border-gray-100 ${notification.read ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${notification.dotColor} mt-1.5 flex-shrink-0`}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs">
                            {notification.title}
                            {notification.read && (
                              <span className="ml-2 text-gray-400 text-xs">
                                (Read)
                              </span>
                            )}
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
              {notifications.filter((n) => !n.read).length > 0 ? (
                notifications
                  .filter((n) => !n.read)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${notification.color} border border-gray-100`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${notification.dotColor} mt-1.5 flex-shrink-0`}
                        />
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
                  <p className="text-gray-500 text-xs">
                    No unread notifications
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="payment" className="space-y-2 mt-0">
              {notifications.filter((n) => n.type === "payment").length > 0 ? (
                notifications
                  .filter((n) => n.type === "payment")
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${notification.color} border border-gray-100 ${notification.read ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${notification.dotColor} mt-1.5 flex-shrink-0`}
                        />
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
                  <p className="text-gray-500 text-xs">
                    No payment notifications
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Chats tab - private group invitations */}
            <TabsContent value="chats" className="space-y-2 mt-0">
              {chatInvites.length > 0 ? (
                chatInvites.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg ${c.read ? "bg-gray-50" : "bg-blue-50"} border border-gray-100`}
                  >
                    <div className="flex items-start gap-3">
                      {c.thumbnail ? (
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-xs">
                          {c.title}
                        </h4>
                        <p className="text-gray-700 text-xs mt-1">
                          You’ve been invited to join {c.title} by{" "}
                          {c.inviterName}
                        </p>
                        <p className="text-blue-600 text-[10px] mt-1">
                          {c.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => acceptInvite(c.token, c.id)}
                          variant="default"
                          className="h-6 px-2 py-1 text-xs"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => rejectInvite(c.token, c.id)}
                          variant="outline"
                          className="h-6 px-2 py-1 text-xs"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 text-xs">
                    No chat notifications yet
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-3 mt-0">
              <h4 className="font-medium text-gray-900 text-sm">
                Notification Settings
              </h4>
              <Separator />

              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-900">
                  Notification Methods
                </h5>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="email-notifications"
                    className="flex flex-col"
                  >
                    <span className="text-xs text-gray-900">
                      Email Notifications
                    </span>
                    <span className="text-xs text-gray-500">
                      Receive notifications via email
                    </span>
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        email: checked,
                      });
                      toast.success("Email notification settings updated");
                    }}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications" className="flex flex-col">
                    <span className="text-xs text-gray-900">
                      Push Notifications
                    </span>
                    <span className="text-xs text-gray-500">
                      Receive push notifications in-app
                    </span>
                  </Label>
                  <Switch
                    id="push-notifications"
                    checked={notificationSettings.push}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        push: checked,
                      });
                      toast.success("Push notification settings updated");
                    }}
                    className="scale-75"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-900">
                  Notification Types
                </h5>

                <div className="flex items-center justify-between">
                  <Label htmlFor="course-updates" className="flex flex-col">
                    <span className="text-xs text-gray-900">
                      Course Updates
                    </span>
                    <span className="text-xs text-gray-500">
                      New content, assignments, and feedback
                    </span>
                  </Label>
                  <Switch
                    id="course-updates"
                    checked={notificationSettings.courseUpdates}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        courseUpdates: checked,
                      });
                      toast.success("Course update settings updated");
                    }}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="assignment-reminders"
                    className="flex flex-col"
                  >
                    <span className="text-xs text-gray-900">
                      Assignment Reminders
                    </span>
                    <span className="text-xs text-gray-500">
                      Deadlines and due date notifications
                    </span>
                  </Label>
                  <Switch
                    id="assignment-reminders"
                    checked={notificationSettings.assignmentReminders}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        assignmentReminders: checked,
                      });
                      toast.success("Assignment reminder settings updated");
                    }}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="system-announcements"
                    className="flex flex-col"
                  >
                    <span className="text-xs text-gray-900">
                      System Announcements
                    </span>
                    <span className="text-xs text-gray-500">
                      Platform updates and maintenance notices
                    </span>
                  </Label>
                  <Switch
                    id="system-announcements"
                    checked={notificationSettings.systemAnnouncements}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        systemAnnouncements: checked,
                      });
                      toast.success("System announcement settings updated");
                    }}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="group-activities" className="flex flex-col">
                    <span className="text-xs text-gray-900">
                      Group Activities
                    </span>
                    <span className="text-xs text-gray-500">
                      Updates from groups and study circles
                    </span>
                  </Label>
                  <Switch
                    id="group-activities"
                    checked={notificationSettings.groupActivities}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        groupActivities: checked,
                      });
                      toast.success("Group activity settings updated");
                    }}
                    className="scale-75"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-900">
                    Payment Notifications
                  </h5>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="payment-notifications"
                      className="flex flex-col"
                    >
                      <span className="text-xs text-gray-900">
                        Payment Notifications
                      </span>
                      <span className="text-xs text-gray-500">
                        Payment confirmations and receipts
                      </span>
                    </Label>
                    <Switch
                      id="payment-notifications"
                      checked={notificationSettings.paymentNotifications}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({
                          ...notificationSettings,
                          paymentNotifications: checked,
                        });
                        toast.success("Payment notification settings updated");
                      }}
                      className="scale-75"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="payment-reminders"
                      className="flex flex-col"
                    >
                      <span className="text-xs text-gray-900">
                        Payment Reminders
                      </span>
                      <span className="text-xs text-gray-500">
                        Upcoming payment notifications
                      </span>
                    </Label>
                    <Switch
                      id="payment-reminders"
                      checked={notificationSettings.paymentReminders}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({
                          ...notificationSettings,
                          paymentReminders: checked,
                        });
                        toast.success("Payment reminder settings updated");
                      }}
                      className="scale-75"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="payment-due-alerts"
                      className="flex flex-col"
                    >
                      <span className="text-xs text-gray-900">
                        Payment Due Alerts
                      </span>
                      <span className="text-xs text-gray-500">
                        Urgent payment due notifications
                      </span>
                    </Label>
                    <Switch
                      id="payment-due-alerts"
                      checked={notificationSettings.paymentDueAlerts}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({
                          ...notificationSettings,
                          paymentDueAlerts: checked,
                        });
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
              disabled={isMarkingAllRead}
            >
              {isMarkingAllRead ? "Marking as read..." : "Mark All as Read"}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default NotificationModal;
