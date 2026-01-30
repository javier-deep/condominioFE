import Chat from "./components/Chat";
import NotificationButton from "./components/NotificationButton";
import "./App.css";

function App() {
  return (
    <div className="app-wrapper">

      <NotificationButton />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-item">🏠 Panel</div>
        <div className="sidebar-item">👥 Residentes</div>
        <div className="sidebar-item">📢 Anuncios</div>
        <div className="sidebar-item active">💬 Chat</div>
        <div className="sidebar-item">⚙️ Configuración</div>
      </aside>

      {/* Área principal */}
      <Chat />

    </div>
  );
}

export default App;
