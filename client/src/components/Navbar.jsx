import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchUnreadCount, fetchNotifications, markNotificationsRead, fetchUnreadNotificationCount } from "../api.js";
import { supabase } from "../supabase.js";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Navbar({ onCreatePost }) {
  const { user, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifData = () => {
    if (!user.isAuthenticated) return;
    fetchUnreadNotificationCount(user.id).then(setUnreadNotifCount).catch(() => {});
  };

  useEffect(() => {
    if (!user.isAuthenticated) return;

    // Initial load
    fetchUnreadCount(user.id).then(setUnreadCount).catch(() => {});
    fetchUnreadNotificationCount(user.id).then(setUnreadNotifCount).catch(() => {});

    // Poll every 30s for message badge
    const interval = setInterval(() => {
      fetchUnreadCount(user.id).then(setUnreadCount).catch(() => {});
    }, 30000);

    // Realtime: listen for new notifications for this user
    if (!supabase) return;
    const channel = supabase
      .channel(`notifications:user:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Bump badge count
          setUnreadNotifCount((prev) => prev + 1);
          // If dropdown is open, prepend new notification
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user.id, user.isAuthenticated]);

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenNotifications = async () => {
    if (!showNotifMenu) {
      try {
        const notifs = await fetchNotifications(user.id);
        setNotifications(notifs);
        setShowNotifMenu(true);
        if (unreadNotifCount > 0) {
          await markNotificationsRead(user.id);
          setUnreadNotifCount(0);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setShowNotifMenu(false);
    }
  };

  const handleNotificationClick = (notif) => {
    setShowNotifMenu(false);
    if (notif.type === "message") {
      navigate("/messages");
    } else if (notif.post_id) {
      navigate(`/post/${notif.post_id}`);
    }
  };

  async function handleSignIn() {
    setAuthError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err.message?.includes("provider is not enabled") || err.status === 400) {
        setAuthError("Google Login is not enabled in your Supabase Dashboard yet.");
      } else {
        setAuthError(err.message || "Failed to sign in with Google.");
      }
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-badge">
            <img src="/favicon.svg" alt="UniFind Logo" className="brand-logo-img" />
          </span>
          <span className="brand-text">
            <strong>UniFind</strong>
            <span>Campus Lost &amp; Found</span>
          </span>
        </Link>

        <div className="navbar-actions">
          {authError && (
            <span className="auth-error-chip" title={authError}>
              ⚠️ {authError}
            </span>
          )}
          {user.isAuthenticated ? (
            <div className="user-profile-menu">
              {/* Notification Bell */}
              <div className="notif-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="navbar-inbox-btn"
                  title="Notifications"
                  aria-label="Notifications"
                  onClick={handleOpenNotifications}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadNotifCount > 0 && (
                    <span className="navbar-inbox-badge">{unreadNotifCount > 9 ? "9+" : unreadNotifCount}</span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="notif-popover">
                    <div className="notif-popover-header">
                      <span>🔔 Notifications</span>
                    </div>
                    <div className="notif-popover-body">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">No notifications yet</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`notif-item ${!n.is_read ? "notif-item--unread" : ""}`}
                            onClick={() => handleNotificationClick(n)}
                          >
                            <span className="notif-type-icon">
                              {n.type === "like" ? "❤️" : n.type === "comment" ? "💬" : "📬"}
                            </span>
                            <div className="notif-item-text">
                              <strong>{n.actor_name}</strong> {n.message}
                              <span className="notif-time">{timeAgo(n.created_at)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Private Messages Inbox */}
              <Link to="/messages" className="navbar-inbox-btn" title="Messages" aria-label="Messages">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="navbar-inbox-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </Link>
              <Link to={`/profile/${user.id}`} className="user-info user-info-link" title="View your profile">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="user-avatar-img"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    {user.initials}
                  </div>
                )}
                <span className="user-name">{user.name}</span>
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={signOut}
                title="Sign out of Google"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="google-signin-btn"
              onClick={handleSignIn}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.05.01 12c0 1.95.45 3.8 1.26 5.42l4.01-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
