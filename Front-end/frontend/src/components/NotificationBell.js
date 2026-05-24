import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000/api";

function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.lu).length;

  useEffect(() => {
    if (!token) return;

    fetchNotifications();

    // Poll for notifications every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [token]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }

  async function handleMarkAsRead(id, e) {
    e.stopPropagation();
    try {
      const res = await fetch(`${API}/notifications/${id}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id_notification === id ? { ...n, lu: true } : n))
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      const res = await fetch(`${API}/notifications/read-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  }

  function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="notification-icon-button"
        title="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button
                className="notification-mark-all-btn"
                onClick={handleMarkAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="notification-dropdown-list">
            {notifications.length === 0 ? (
              <div className="notification-empty-state">
                <i className="fas fa-bell-slash notification-empty-icon"></i>
                <span className="notification-empty-text">
                  Aucune notification
                </span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id_notification}
                  onClick={(e) => !n.lu && handleMarkAsRead(n.id_notification, e)}
                  className={`notification-item ${n.lu ? "read" : "unread"}`}
                >
                  <div className="notification-item-title">
                    {!n.lu && <span className="notification-item-dot"></span>}
                    {n.titre}
                  </div>
                  <p className="notification-item-message">{n.message}</p>
                  <span className="notification-item-time">
                    {formatTime(n.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
