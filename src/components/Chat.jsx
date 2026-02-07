import { useEffect, useState, useTransition } from "react";
import axios from "axios";
import "../services/echo";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const channel = window.Echo.channel("chat");

    channel.listen("MessageSent", (e) => {
      setMessages((prev) => [...prev, e.message]);
    });

    return () => {
      window.Echo.leaveChannel("chat");
    };
  }, []);

  // Función para mostrar alertas con transición
  const showAlertWithTransition = (message, type = "success", duration = 3000) => {
    setAlert({ message, type });
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
      setTimeout(() => setAlert(null), 500);
    }, duration);
  };

  const sendMessage = async () => {
    if (!text.trim() || sending) return;

    const messageData = {
      user: "Vecino",
      message: text,
    };

    setSending(true);

    try {
      await axios.post("http://localhost:8001/api/chat/send", messageData);
      setText("");
      showAlertWithTransition("✓ Mensaje enviado exitosamente", "success", 3000);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      showAlertWithTransition(
        error.response?.data?.message || "No se pudo enviar el mensaje. Revisa si el backend está prendido.",
        "error",
        4000
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-container">

      {/* Header */}
      <div className="chat-header">
        <h2>Chat general</h2>
        <span>10 residentes conectados</span>
      </div>

      {/* Mensajes */}
      <div className="chat-messages-area">
        {messages.length === 0 && (
          <p style={{ color: "#999" }}>No hay mensajes aún...</p>
        )}

        {messages.map((m, i) => (
          <p key={i}>
            <strong>{m.user}: </strong>{m.message}
          </p>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <div className="input-wrapper">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje"
            onKeyDown={(e) => e.key === "Enter" && !sending && sendMessage()}
            disabled={sending}
          />
          <button 
            className="send-icon-btn" 
            onClick={sendMessage}
            disabled={sending}
            title={sending ? "Enviando..." : "Enviar mensaje"}
          >
            {sending ? "⏳" : "➤"}
          </button>
        </div>
      </div>

      {/* Alerta con transición */}
      {alert && (
        <div 
          className={`chat-alert ${alert.type} ${showAlert ? "show" : "hide"}`}
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