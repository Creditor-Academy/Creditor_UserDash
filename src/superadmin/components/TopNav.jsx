import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  LogOut,
  Settings,
  User,
  Check,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../theme/colors";
import {
  fetchSuperadminNotifications,
  markAllSuperadminNotificationsRead,
} from "../../services/notificationService";

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export default function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const colors = theme === "dark" ? darkTheme : lightTheme;
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeNotificationTab, setActiveNotificationTab] = useState("all");
  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "loading...",
    firstName: "",
    lastName: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Notifications data
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [notificationError, setNotificationError] = useState(null);

  const formatTime = (ts) => {
    if (!ts) return "Just now";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return d.toLocaleString();
  };

  const normalizeNotification = (n, idx) => {
    const rawType = n?.type || n?.category || "system";
    const lowered =
      typeof rawType === "string" ? rawType.toLowerCase() : "system";
    let type = lowered;
    if (lowered.includes("payment")) type = "payment";
    else if (lowered.includes("ticket")) type = "ticket";

    return {
      id: n?.id || n?._id || idx,
      title: n?.title || n?.subject || "Notification",
      message: n?.message || n?.body || n?.description || "",
      time: formatTime(n?.createdAt || n?.time || n?.timestamp),
      read: n?.read ?? n?.is_read ?? false,
      type,
    };
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || ""}/api/user/getUserProfile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data && response.data.data) {
          const user = response.data.data;
          setUserData({
            name:
              user.full_name ||
              `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
              "User",
            email: user.email || "No email",
            firstName: user.first_name || "",
            lastName: user.last_name || "",
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile data");
        // Fallback to local storage if available
        const storedUser = localStorage.getItem("superadminData");
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setUserData({
              name: user.name || "User",
              email: user.email || "No email",
              firstName: user.firstName || "",
              lastName: user.lastName || "",
            });
          } catch (e) {
            console.error("Error parsing stored user data:", e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch notifications from API
  useEffect(() => {
    let isMounted = true;
    const loadNotifications = async () => {
      try {
        setNotificationLoading(true);
        const res = await fetchSuperadminNotifications();
        if (!isMounted) return;
        const raw =
          res?.data?.data || res?.data?.notifications || res?.data || [];
        const mapped = Array.isArray(raw)
          ? raw.map((n, idx) => normalizeNotification(n, idx))
          : [];
        setNotifications(mapped);
        setNotificationError(null);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching notifications:", err);
        setNotificationError("Failed to load notifications");
        setNotifications([]);
      } finally {
        if (isMounted) setNotificationLoading(false);
      }
    };
    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("superadminData");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const handleClearAllNotifications = async () => {
    try {
      setNotificationLoading(true);
      await markAllSuperadminNotificationsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true })),
      );
      setNotificationError(null);
    } catch (err) {
      console.error("Error marking all notifications read:", err);
      setNotificationError("Failed to mark all notifications as read");
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const notificationTabs = [
    { key: "all", label: "All" },
    { key: "payment", label: "Payments" },
    { key: "ticket", label: "Tickets" },
  ];

  const filteredNotifications = notifications.filter((notification) => {
    if (activeNotificationTab === "all") return true;
    if (activeNotificationTab === "payment")
      return notification.type === "payment";
    if (activeNotificationTab === "ticket")
      return notification.type === "ticket";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav
      className="fixed top-0 left-20 right-0 h-20 flex items-center justify-between px-8 z-40 transition-colors duration-300"
      style={{
        backgroundColor:
          theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${colors.border}`,
        boxShadow:
          theme === "dark"
            ? "0 8px 32px rgba(0,0,0,0.3)"
            : "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-center gap-3 flex-1">
        <span
          className="text-xl md:text-2xl font-bold whitespace-nowrap -ml-1"
          style={{ color: theme === "dark" ? "#ffffff" : "rgb(81, 55, 82)" }}
        >
          Athena LMS
        </span>
        <div className="flex-1 max-w-2xl">
          <div
            className="relative flex items-center rounded-2xl px-5 py-3 transition-colors duration-300"
            style={{
              backgroundColor:
                theme === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.05)",
              border: `1px solid ${colors.border}`,
            }}
          >
            <Search size={20} style={{ color: colors.text.tertiary }} />
            <input
              type="text"
              placeholder="Search analytics, reports, users..."
              className="flex-1 bg-transparent border-none outline-none ml-3 text-sm transition-colors duration-300"
              style={{ color: colors.text.primary }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-8">
        {/* Notification */}
        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 relative"
          style={{
            backgroundColor:
              theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = colors.bg.hover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)")
          }
          title="Notifications"
        >
          <Bell size={20} style={{ color: colors.text.muted }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: colors.accent.red }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Theme Switch */}
        <button
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor:
              theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = colors.bg.hover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)")
          }
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun size={20} style={{ color: colors.text.muted }} />
          ) : (
            <Moon size={20} style={{ color: colors.text.muted }} />
          )}
        </button>

        {/* Notification Dropdown */}
        {isNotificationOpen &&
          createPortal(
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6"
              style={{
                backgroundColor:
                  theme === "dark"
                    ? "rgba(15,23,42,0.55)"
                    : "rgba(15,23,42,0.28)",
                backdropFilter: "blur(6px)",
              }}
              onClick={() => setIsNotificationOpen(false)}
            >
              <div
                className="w-full max-w-[520px] max-h-[640px] rounded-2xl shadow-2xl overflow-hidden relative"
                style={{
                  background:
                    theme === "dark"
                      ? "linear-gradient(145deg, rgba(17,24,39,0.95), rgba(17,24,39,0.85))"
                      : "linear-gradient(145deg, #ffffff, #f8fafc)",
                  border: `1px solid ${colors.border}`,
                  boxShadow:
                    theme === "dark"
                      ? "0 30px 80px rgba(0,0,0,0.55)"
                      : "0 25px 55px rgba(15,23,42,0.12)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor:
                      theme === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(15,23,42,0.06)",
                    border: `1px solid ${colors.border}`,
                    color: colors.text.secondary,
                  }}
                  onClick={() => setIsNotificationOpen(false)}
                  aria-label="Close notifications"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div
                  className="px-5 py-4 border-b flex items-center justify-between gap-3"
                  style={{ borderColor: colors.border }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          theme === "dark"
                            ? "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(59,130,246,0.08))"
                            : "linear-gradient(135deg, rgba(59,130,246,0.14), #eef2ff)",
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <Bell size={18} style={{ color: colors.accent.blue }} />
                    </div>
                    <div>
                      <h3
                        className="text-base font-semibold"
                        style={{ color: colors.text.primary }}
                      >
                        Notifications
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: colors.text.tertiary }}
                      >
                        Stay updated with system and user activity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          color: colors.accent.blue,
                          backgroundColor:
                            theme === "dark"
                              ? "rgba(59, 130, 246, 0.14)"
                              : "rgba(59, 130, 246, 0.12)",
                        }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div
                  className="flex px-4 py-3 gap-2 overflow-x-auto border-b"
                  style={{ borderColor: colors.border }}
                >
                  {notificationTabs.map((tab) => {
                    const isActive = activeNotificationTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveNotificationTab(tab.key)}
                        className="px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all"
                        style={{
                          color: isActive
                            ? colors.text.primary
                            : colors.text.secondary,
                          backgroundColor: isActive
                            ? theme === "dark"
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(15,23,42,0.06)"
                            : "transparent",
                          border: `1px solid ${
                            isActive ? colors.border : "transparent"
                          }`,
                          boxShadow: isActive
                            ? "0 10px 30px rgba(0,0,0,0.12)"
                            : "none",
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Notifications List */}
                <div className="max-h-[380px] overflow-y-auto px-5 py-4 space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <div
                        className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor:
                            theme === "dark"
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(15,23,42,0.05)",
                        }}
                      >
                        <Bell
                          size={22}
                          style={{ color: colors.text.secondary }}
                        />
                      </div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.text.primary }}
                      >
                        No notifications yet
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: colors.text.secondary }}
                      >
                        You're all caught up. We'll keep you posted.
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => {
                      const isUnread = !notification.read;
                      const accentMap = {
                        system: colors.accent.blue,
                        user: colors.accent.green || "#22c55e",
                        security: colors.accent.red,
                        welcome: colors.accent.orange || "#f97316",
                      };
                      const badgeColor =
                        accentMap[notification.type] || colors.text.secondary;

                      return (
                        <div
                          key={notification.id}
                          className="p-4 rounded-xl border transition-all cursor-pointer"
                          style={{
                            backgroundColor: isUnread
                              ? theme === "dark"
                                ? "rgba(59,130,246,0.08)"
                                : "rgba(59,130,246,0.06)"
                              : theme === "dark"
                                ? "rgba(255,255,255,0.03)"
                                : "#ffffff",
                            borderColor: colors.border,
                            boxShadow: isUnread
                              ? "0 10px 30px rgba(59,130,246,0.15)"
                              : theme === "dark"
                                ? "0 10px 20px rgba(0,0,0,0.25)"
                                : "0 12px 24px rgba(15,23,42,0.08)",
                          }}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  theme === "dark"
                                    ? "rgba(255,255,255,0.06)"
                                    : "rgba(15,23,42,0.06)",
                                border: `1px solid ${colors.border}`,
                              }}
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: badgeColor,
                                  boxShadow: `0 0 0 6px ${
                                    theme === "dark"
                                      ? "rgba(59,130,246,0.08)"
                                      : "rgba(59,130,246,0.08)"
                                  }`,
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className="text-sm font-semibold truncate"
                                  style={{ color: colors.text.primary }}
                                >
                                  {notification.title}
                                </p>
                                <span
                                  className="text-[11px] px-2 py-1 rounded-full border"
                                  style={{
                                    color: badgeColor,
                                    borderColor: colors.border,
                                    backgroundColor:
                                      theme === "dark"
                                        ? "rgba(255,255,255,0.04)"
                                        : "rgba(15,23,42,0.03)",
                                  }}
                                >
                                  {notification.type}
                                </span>
                              </div>
                              <p
                                className="text-xs mt-1 leading-relaxed line-clamp-2"
                                style={{ color: colors.text.secondary }}
                              >
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-[11px]">
                                <span style={{ color: colors.text.tertiary }}>
                                  {notification.time}
                                </span>
                                {isUnread && (
                                  <span
                                    className="px-2 py-1 rounded-full"
                                    style={{
                                      backgroundColor:
                                        theme === "dark"
                                          ? "rgba(59,130,246,0.15)"
                                          : "rgba(59,130,246,0.12)",
                                      color: colors.accent.blue,
                                      border: `1px solid ${colors.border}`,
                                    }}
                                  >
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div
                  className="px-4 py-3 border-t flex items-center gap-3"
                  style={{ borderColor: colors.border }}
                >
                  <button
                    onClick={() => {
                      handleClearAllNotifications();
                      setActiveNotificationTab("all");
                    }}
                    className="flex-1 text-sm py-3 rounded-xl font-medium transition-all"
                    style={{
                      color: colors.text.primary,
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(15,23,42,0.05)",
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* Profile Menu */}
        <div className="relative ml-2">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-11 h-11 rounded-xl overflow-hidden transition-transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #FF7A3D, #A065F4)",
              boxShadow: "0 0 20px rgba(255,122,61,0.3)",
            }}
            title="Profile Menu"
          >
            <div className="w-full h-full flex items-center justify-center text-white font-semibold">
              {isLoading ? "..." : getInitials(userData.name)}
            </div>
          </button>

          {/* Dropdown */}
          {isProfileMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50"
              style={{
                backgroundColor: colors.bg.secondary,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: colors.border }}
              >
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: colors.text.primary }}
                  title={userData.name}
                >
                  {isLoading ? "Loading..." : userData.name}
                </p>
                <p
                  className="text-xs mt-1 truncate"
                  style={{ color: colors.text.secondary }}
                  title={userData.email}
                >
                  {isLoading ? "loading..." : userData.email}
                </p>
              </div>

              <div className="py-2">
                <button
                  onClick={() => {
                    navigate("/superadmin/profile");
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-3"
                  style={{ color: colors.text.primary }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = colors.bg.hover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <User size={16} />
                  <span className="text-sm">Profile</span>
                </button>

                {/* <button
                  className="w-full px-4 py-2 flex items-center gap-3"
                  style={{ color: colors.text.primary }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor = colors.bg.hover)
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <Settings size={16} />
                  <span className="text-sm">Settings</span>
                </button> */}

                <div
                  className="my-1"
                  style={{ borderTop: `1px solid ${colors.border}` }}
                ></div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 flex items-center gap-3"
                  style={{ color: "#EF4444" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(239, 68, 68, 0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}

          {isProfileMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsProfileMenuOpen(false)}
            />
          )}
        </div>

        {/* Notification Dropdown Overlay */}
        {isNotificationOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsNotificationOpen(false)}
          />
        )}
      </div>
    </nav>
  );
}
