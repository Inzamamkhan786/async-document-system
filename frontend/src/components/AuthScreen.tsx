import { useState } from "react";
import { authService, AuthUser } from "../services/auth";

export default function AuthScreen({ onAuth }: { onAuth: (user: AuthUser) => void }) {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handle = async () => {
        setError("");
        setLoading(true);
        try {
            let user: AuthUser;
            if (mode === "login") {
                user = await authService.login(email, password);
            } else {
                if (!username.trim()) { setError("Username is required"); setLoading(false); return; }
                user = await authService.signup(email, username, password);
            }
            authService.saveUser(user);
            onAuth(user);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", background: "#0a0a0f",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Courier New', monospace",
        }}>
            <div style={{ width: "100%", maxWidth: "420px", padding: "0 1.5rem" }}>

                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div style={{ fontSize: "2rem", color: "#38bdf8", marginBottom: "0.5rem" }}>⚡</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: "700", color: "#38bdf8", letterSpacing: "3px" }}>
                        DOCFLOW
                    </div>
                    <div style={{ color: "#475569", fontSize: "0.75rem", letterSpacing: "2px", marginTop: "0.3rem" }}>
                        ASYNC DOCUMENT PROCESSING
                    </div>
                </div>

                {/* Toggle */}
                <div style={{
                    display: "flex", marginBottom: "2rem",
                    border: "1px solid #1e293b", background: "#0d0d14",
                }}>
                    {(["login", "signup"] as const).map((m) => (
                        <button key={m} onClick={() => { setMode(m); setError(""); }}
                            style={{
                                flex: 1, padding: "0.65rem",
                                background: mode === m ? "#38bdf8" : "transparent",
                                color: mode === m ? "#0a0a0f" : "#475569",
                                border: "none", cursor: "pointer",
                                fontFamily: "inherit", fontSize: "0.8rem",
                                letterSpacing: "1.5px", fontWeight: mode === m ? "700" : "400",
                                transition: "all 0.2s",
                            }}>
                            {m.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "#475569", letterSpacing: "1px", marginBottom: "0.4rem" }}>
                            EMAIL
                        </label>
                        <input
                            type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={{
                                width: "100%", background: "#0d0d14",
                                border: "1px solid #1e293b", color: "#e2e8f0",
                                padding: "0.65rem 0.9rem", fontFamily: "inherit",
                                fontSize: "0.85rem",
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handle()}
                        />
                    </div>

                    {mode === "signup" && (
                        <div>
                            <label style={{ display: "block", fontSize: "0.7rem", color: "#475569", letterSpacing: "1px", marginBottom: "0.4rem" }}>
                                USERNAME
                            </label>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="your_username"
                                style={{
                                    width: "100%", background: "#0d0d14",
                                    border: "1px solid #1e293b", color: "#e2e8f0",
                                    padding: "0.65rem 0.9rem", fontFamily: "inherit",
                                    fontSize: "0.85rem",
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handle()}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "#475569", letterSpacing: "1px", marginBottom: "0.4rem" }}>
                            PASSWORD
                        </label>
                        <input
                            type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: "100%", background: "#0d0d14",
                                border: "1px solid #1e293b", color: "#e2e8f0",
                                padding: "0.65rem 0.9rem", fontFamily: "inherit",
                                fontSize: "0.85rem",
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handle()}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: "#3f0b0b", border: "1px solid #7f1d1d",
                            color: "#f87171", padding: "0.65rem 0.9rem",
                            fontSize: "0.8rem", letterSpacing: "0.5px",
                        }}>
                            ✕ {error}
                        </div>
                    )}

                    <button
                        onClick={handle} disabled={loading}
                        style={{
                            width: "100%", padding: "0.8rem",
                            background: loading ? "#164e63" : "#38bdf8",
                            color: "#0a0a0f", border: "none",
                            fontFamily: "inherit", fontSize: "0.85rem",
                            letterSpacing: "2px", fontWeight: "700",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "background 0.2s", marginTop: "0.5rem",
                        }}
                    >
                        {loading ? "PLEASE WAIT..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
                    </button>
                </div>

                <div style={{ textAlign: "center", marginTop: "1.5rem", color: "#334155", fontSize: "0.72rem" }}>
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <span
                        style={{ color: "#38bdf8", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                    >
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </span>
                </div>
            </div>
        </div>
    );
}