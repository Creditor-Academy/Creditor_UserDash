import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Shield,
  CreditCard,
  Users,
  AlertTriangle,
  MessageCircle,
  Filter,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../theme/colors";

const notificationSeeds = [
  {
    id: 1,
    title: "System Update Available",
    message:
      "A new system update has been released. Please review the changelog.",
    time: "2 hours ago",
    read: false,
    type: "system",
  },
  {
    id: 2,
    title: "Payment Received",
    message: "Your latest invoice has been paid successfully.",
    time: "3 hours ago",
    read: false,
    type: "payment",
  },
  {
    id: 3,
    title: "New User Registration",
    message: "John Doe has completed verification.",
    time: "5 hours ago",
    read: true,
    type: "user",
  },
  {
    id: 4,
    title: "Security Alert",
    message: "Unusual login activity detected. Please review access logs.",
    time: "1 day ago",
    read: false,
    type: "security",
  },
  {
    id: 5,
    title: "Support Reply",
    message: "A support agent replied to your chat thread.",
    time: "2 days ago",
    read: true,
    type: "chats",
  },
];

const tabs = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "payment", label: "Payment" },
  { key: "user", label: "Users" },
  { key: "system", label: "System" },
  { key: "security", label: "Security" },
  { key: "chats", label: "Chats" },
];

const badgeMap = (themeColors) => ({
  system: { color: themeColors.accent.blue, icon: Bell },
  payment: { color: themeColors.accent.green || "#22c55e", icon: CreditCard },
  user: { color: themeColors.accent.purple || "#a855f7", icon: Users },
  security: { color: themeColors.accent.red, icon: Shield },
  chats: { color: themeColors.accent.orange || "#f97316", icon: MessageCircle },
  default: { color: themeColors.text.secondary, icon: Bell },
});

export default function Notifications() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkTheme : lightTheme;
  const [activeTab, setActiveTab] = useState("all");
  const [items, setItems] = useState(notificationSeeds);

  const filtered = useMemo(() => {
    if (activeTab === "all") return items;
    if (activeTab === "unread") return items.filter((n) => !n.read);
    return items.filter((n) => n.type === activeTab);
  }, [activeTab, items]);

  const unreadCount = items.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = (id) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const badges = badgeMap(colors);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: colors.text.tertiary }}
          >
            Superadmin
          </p>
          <h1
            className="text-2xl md:text-3xl font-bold mt-1"
            style={{ color: colors.text.primary }}
          >
            Notifications
          </h1>
          <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>
            Stay on top of payments, security alerts, and user activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="px-4 py-2 rounded-xl text-sm font-medium border"
            style={{
              color: colors.accent.blue,
              borderColor: colors.border,
              backgroundColor:
                theme === "dark"
                  ? "rgba(59,130,246,0.12)"
                  : "rgba(59,130,246,0.08)",
            }}
          >
            {unreadCount} Unread
          </div>
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              color: theme === "dark" ? "#0f172a" : "#ffffff",
              background: "linear-gradient(135deg, #60a5fa, #c084fc, #f97316)",
              boxShadow: "0 10px 30px rgba(96,165,250,0.35)",
            }}
          >
            Mark All as Read
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl border shadow-xl overflow-hidden"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(145deg, rgba(17,24,39,0.9), rgba(15,23,42,0.8))"
              : "linear-gradient(145deg, #ffffff, #f8fafc)",
          borderColor: colors.border,
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
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
              <h2
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Center
              </h2>
              <p className="text-xs" style={{ color: colors.text.tertiary }}>
                Filter and review notifications by category
              </p>
            </div>
          </div>
          <div
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm border"
            style={{
              color: colors.text.secondary,
              borderColor: colors.border,
              backgroundColor:
                theme === "dark"
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(15,23,42,0.04)",
            }}
          >
            <Filter size={16} />
            Quick filter
          </div>
        </div>

        <div
          className="flex flex-wrap gap-2 px-4 py-3 border-b"
          style={{ borderColor: colors.border }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-4 py-2 text-sm font-medium rounded-full transition-all"
                style={{
                  color: isActive ? colors.text.primary : colors.text.secondary,
                  backgroundColor: isActive
                    ? theme === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(15,23,42,0.06)"
                    : "transparent",
                  border: `1px solid ${isActive ? colors.border : "transparent"}`,
                  boxShadow: isActive ? "0 10px 30px rgba(0,0,0,0.12)" : "none",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-5 space-y-3 max-h-[520px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div
              className="py-16 text-center rounded-2xl border border-dashed"
              style={{
                borderColor: colors.border,
                backgroundColor:
                  theme === "dark" ? "rgba(255,255,255,0.02)" : "#ffffff",
              }}
            >
              <div
                className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    theme === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(15,23,42,0.05)",
                }}
              >
                <CheckCircle2
                  size={22}
                  style={{ color: colors.text.secondary }}
                />
              </div>
              <p
                className="text-base font-semibold"
                style={{ color: colors.text.primary }}
              >
                No notifications yet
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.secondary }}
              >
                You're all caught up. We'll notify you when there's something
                new.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const meta = badges[item.type] || badges.default;
              const Icon = meta.icon || Bell;
              const isUnread = !item.read;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border transition-all cursor-pointer"
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
                      ? "0 10px 30px rgba(59,130,246,0.16)"
                      : theme === "dark"
                        ? "0 12px 28px rgba(0,0,0,0.2)"
                        : "0 14px 24px rgba(15,23,42,0.08)",
                  }}
                  onClick={() => handleMarkRead(item.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(15,23,42,0.06)",
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <Icon size={18} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-sm md:text-base font-semibold truncate"
                          style={{ color: colors.text.primary }}
                        >
                          {item.title}
                        </p>
                        <span
                          className="text-[11px] px-2 py-1 rounded-full border"
                          style={{
                            color: meta.color,
                            borderColor: colors.border,
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(255,255,255,0.04)"
                                : "rgba(15,23,42,0.03)",
                          }}
                        >
                          {item.type}
                        </span>
                        {isUnread && (
                          <span
                            className="text-[11px] px-2 py-1 rounded-full"
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
                      <p
                        className="text-sm mt-1 leading-relaxed"
                        style={{ color: colors.text.secondary }}
                      >
                        {item.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[12px]">
                        <span style={{ color: colors.text.tertiary }}>
                          {item.time}
                        </span>
                        {item.read && (
                          <span
                            className="flex items-center gap-1"
                            style={{ color: colors.text.secondary }}
                          >
                            <CheckCircle2 size={14} /> Read
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
      </div>
    </div>
  );
}
