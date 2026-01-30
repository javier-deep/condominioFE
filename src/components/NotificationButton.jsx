import { useEffect, useState } from "react";
import "../services/echo";

export default function NotificationButton() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const channel = window.Echo.channel("notifications");

      channel.listen("NotificationSent", (e) => {
        const n = {
          id: e.id || (e.notification && e.notification.id) || Date.now(),
          type: e.type || (e.notification && e.notification.type) || "general",
          title:
            e.title || (e.notification && e.notification.title) ||
            (e.data && e.data.title) || "Nueva notificación",
          body: e.body || (e.notification && e.notification.body) || (e.data && e.data.message) || "",
          url: e.url || (e.notification && e.notification.url) || (e.data && e.data.url) || null,
        };

        setNotifications((prev) => [n, ...prev]);
      });

      channel.listen(
        ".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
        (e) => {
          const payload = e && e.notification ? e.notification : e;
          const n = {
            id: payload.id || Date.now(),
            type: payload.type || "general",
            title: payload.title || (payload.data && payload.data.title) || "Notificación",
            body: (payload.data && (payload.data.message || payload.data.body)) || "",
            url: (payload.data && payload.data.url) || null,
          };
          setNotifications((prev) => [n, ...prev]);
        }
      );

      return () => {
        try {
          window.Echo.leaveChannel("notifications");
        } catch (err) {
        }
      };
    } catch (err) {
      console.warn("Echo no está disponible para notificaciones:", err);
    }
  }, []);

  const handleOpen = () => setOpen((v) => !v);

  const openNotification = (n) => {
    setNotifications((prev) => prev.filter((item) => item.id !== n.id));
    if (n.url) {
      window.location.href = n.url;
    }
  };

  return (
    <div className="notification-wrapper">
      <button className="notification-btn" onClick={handleOpen} aria-label="Notificaciones">
        🔔
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <div className="notification-empty">No hay notificaciones</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="notification-item"
                onClick={() => openNotification(n)}
              >
                <div className="notification-type">{iconForType(n.type)}</div>
                <div className="notification-content">
                  <div className="notification-title">{n.title}</div>
                  {n.body && <div className="notification-body">{n.body}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function iconForType(type) {
  switch ((type || "").toLowerCase()) {
    case "mensaje":
    case "message":
      return "💬";
    case "multas":
    case "fine":
      return "⚠️";
    case "asambleas":
    case "assembly":
      return "🗓️";
    case "pagos":
    case "pago":
    case "payment":
      return "💳";
    default:
      return "🔔";
  }
}
