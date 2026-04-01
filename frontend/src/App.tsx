import { useState } from "react";
import Dashboard from "./components/Dashboard";
import UploadScreen from "./components/UploadScreen";
import DetailScreen from "./components/DetailScreen";
import ProgressMonitor from "./components/ProgressMonitor";
import AuthScreen from "./components/AuthScreen";
import { authService, AuthUser } from "./services/auth";
import "./App.css";

export type Screen = "dashboard" | "upload" | "detail";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(authService.getUser());
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const goToDetail = (id: number) => {
    setSelectedJobId(id);
    setScreen("detail");
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setScreen("dashboard");
  };

  // Not logged in — show auth screen
  if (!user) {
    return <AuthScreen onAuth={(u) => setUser(u)} />;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">⚡ DocFlow</div>
        <div className="nav-links">
          <button
            className={screen === "dashboard" ? "nav-btn active" : "nav-btn"}
            onClick={() => setScreen("dashboard")}
          >Dashboard</button>
          <button
            className={screen === "upload" ? "nav-btn active" : "nav-btn"}
            onClick={() => setScreen("upload")}
          >Upload</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#475569", fontSize: "0.75rem", letterSpacing: "1px" }}>
            {user.username}
          </span>
          <button
            className="nav-btn"
            onClick={handleLogout}
            style={{ fontSize: "0.72rem", color: "#f87171", borderColor: "#3f0b0b" }}
          >
            LOGOUT
          </button>
        </div>
      </nav>

      <ProgressMonitor />

      <main className="main-content">
        {screen === "dashboard" && <Dashboard onSelectJob={goToDetail} />}
        {screen === "upload" && <UploadScreen onDone={() => setScreen("dashboard")} />}
        {screen === "detail" && selectedJobId && (
          <DetailScreen jobId={selectedJobId} onBack={() => setScreen("dashboard")} />
        )}
      </main>
    </div>
  );
}