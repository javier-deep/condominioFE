import { useEffect, useState, useTransition } from "react";
import axios from "axios";
import "../services/echo";

export default function NotificationButton() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const [alert, setAlert] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

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

  // Función para mostrar alertas con transición
  const showAlertWithTransition = (message, type = "success", duration = 4000) => {
    setAlert({ message, type });
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
      setTimeout(() => setAlert(null), 500);
    }, duration);
  };

  const handleFetchData = () => {
    startTransition(async () => {
      try {
        const response = await axios.get("http://localhost:8001/api/notifications");
        showAlertWithTransition(`Datos cargados: ${response.data.length} registros`, "success");
      } catch (error) {
        showAlertWithTransition(
          error.response?.data?.message || "Error al cargar datos",
          "error"
        );
      }
    });
  };

  const handleSendNotification = () => {
    startTransition(async () => {
      try {
        const response = await axios.post("http://localhost:8001/api/notifications/send", {
          title: "Notificación de prueba",
          message: "Esta es una notificación de prueba",
          type: "general",
        });
        showAlertWithTransition("✓ Notificación enviada correctamente", "success");
      } catch (error) {
        showAlertWithTransition(
          error.response?.data?.message || "Error al enviar notificación",
          "error"
        );
      }
    });
  };

  const handleClearNotifications = () => {
    startTransition(async () => {
      try {
        await axios.delete("http://localhost:8001/api/notifications/clear");
        setNotifications([]);
        showAlertWithTransition("✓ Notificaciones eliminadas", "success");
      } catch (error) {
        showAlertWithTransition(
          error.response?.data?.message || "Error al eliminar notificaciones",
          "error"
        );
      }
    });
  };

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
          {/* Botones de acción */}
          <div className="notification-actions">
            <button 
              onClick={handleFetchData}
              disabled={isLoading}
              className="action-btn fetch-btn"
              title="Cargar datos desde el servidor"
            >
              {isLoading ? "⏳ Cargando..." : "📥 Cargar datos"}
            </button>
            <button 
              onClick={handleSendNotification}
              disabled={isLoading}
              className="action-btn send-btn"
              title="Enviar una notificación de prueba"
            >
              {isLoading ? "⏳ Enviando..." : "📤 Enviar prueba"}
            </button>
            <button 
              onClick={handleClearNotifications}
              disabled={isLoading || notifications.length === 0}
              className="action-btn clear-btn"
              title="Eliminar todas las notificaciones"
            >
              {isLoading ? "⏳ Limpiando..." : "🗑️ Limpiar"}
            </button>
          </div>

          <div className="notification-divider"></div>

          {/* Lista de notificaciones */}
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

      {/* Alerta con transición */}
      {alert && (
        <div 
          className={`notification-alert ${alert.type} ${showAlert ? "show" : "hide"}`}
          role="alert"
        >
          <div className="alert-content">
            {alert.type === "success" ? "✅" : "❌"} {alert.message}
          </div>
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
