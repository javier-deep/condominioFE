import { useEffect, useState } from "react";
import axios from "axios";
import "../services/echo";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const channel = window.Echo.channel("chat");

    channel.listen("MessageSent", (e) => {
      setMessages((prev) => [...prev, e.message]);
    });

    return () => {
      window.Echo.leaveChannel("chat");
    };
  }, []);

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
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("No se pudo enviar el mensaje. Revisa si el backend está prendido.");
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
          >
            {sending ? "..." : "➤"}
          </button>
        </div>
      </div>

    </div>
  );
}