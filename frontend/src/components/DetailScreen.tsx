import { useEffect, useState } from "react";
import { api, Job } from "../services/api";

export default function DetailScreen({ jobId, onBack }: { jobId: number; onBack: () => void }) {
    const [job, setJob] = useState<Job | null>(null);
    const [editing, setEditing] = useState(false);
    const [editResult, setEditResult] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    const fetchJob = async () => {
        const data = await api.getJob(jobId);
        setJob(data);
        setEditResult(data.result ? { ...data.result } : null);
    };

    useEffect(() => { fetchJob(); }, [jobId]);

    const handleSave = async () => {
        if (!job) return;
        setSaving(true);
        await api.updateJob(job.id, editResult);
        await fetchJob();
        setEditing(false);
        setSaving(false);
        setMsg("Saved!");
        setTimeout(() => setMsg(""), 2000);
    };

    const handleFinalize = async () => {
        if (!job) return;
        await api.finalizeJob(job.id);
        await fetchJob();
        setMsg("Finalized!");
        setTimeout(() => setMsg(""), 2000);
    };

    const handleRetry = async () => {
        if (!job) return;
        await api.retryJob(job.id);
        await fetchJob();
        setMsg("Retrying...");
        setTimeout(() => setMsg(""), 2000);
    };

    if (!job) return <div style={{ color: "#475569" }}>Loading...</div>;

    return (
        <div>
            <button className="btn" onClick={onBack} style={{ marginBottom: "1.5rem", fontSize: "0.8rem" }}>
                ← BACK
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.3rem", letterSpacing: "2px", color: "#38bdf8" }}>{job.filename}</h1>
                    <div style={{ color: "#475569", fontSize: "0.8rem", marginTop: "0.3rem" }}>
                        Job #{job.id} · {new Date(job.created_at).toLocaleString()}
                    </div>
                </div>
                <span className={`badge badge-${job.status}`}>{job.status}</span>
            </div>

            {msg && (
                <div className="card" style={{ borderColor: "#4ade80", color: "#4ade80", marginBottom: "1rem", padding: "0.8rem 1rem" }}>
                    ✓ {msg}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {job.status === "completed" && !editing && (
                    <button className="btn" onClick={() => setEditing(true)}>✎ EDIT RESULT</button>
                )}
                {editing && (
                    <>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? "SAVING..." : "✓ SAVE"}
                        </button>
                        <button className="btn" onClick={() => setEditing(false)}>✕ CANCEL</button>
                    </>
                )}
                {job.status === "completed" && (
                    <button className="btn btn-success" onClick={handleFinalize}>⚑ FINALIZE</button>
                )}
                {job.status === "failed" && (
                    <button className="btn btn-danger" onClick={handleRetry}>↺ RETRY</button>
                )}
                {(job.status === "completed" || job.status === "finalized") && job.result && (
                    <>
                        <button className="btn" onClick={() => api.exportJSON(job.id)}>↓ JSON</button>
                        <button className="btn" onClick={() => api.exportCSV(job.id)}>↓ CSV</button>
                    </>
                )}
            </div>

            {/* Result */}
            {job.result ? (
                <div className="card">
                    <div style={{ fontSize: "0.75rem", letterSpacing: "2px", color: "#475569", marginBottom: "1rem" }}>
                        EXTRACTED RESULT
                    </div>
                    {editing && editResult ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            {["title", "category", "summary"].map((field) => (
                                <div key={field}>
                                    <label style={{ display: "block", fontSize: "0.75rem", color: "#475569", marginBottom: "0.3rem", letterSpacing: "1px" }}>
                                        {field.toUpperCase()}
                                    </label>
                                    {field === "summary" ? (
                                        <textarea rows={3} value={editResult[field] || ""}
                                            onChange={(e) => setEditResult({ ...editResult, [field]: e.target.value })} />
                                    ) : (
                                        <input value={editResult[field] || ""}
                                            onChange={(e) => setEditResult({ ...editResult, [field]: e.target.value })} />
                                    )}
                                </div>
                            ))}
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", color: "#475569", marginBottom: "0.3rem", letterSpacing: "1px" }}>
                                    KEYWORDS (comma separated)
                                </label>
                                <input
                                    value={(editResult.keywords || []).join(", ")}
                                    onChange={(e) => setEditResult({
                                        ...editResult,
                                        keywords: e.target.value.split(",").map((k: string) => k.trim()).filter(Boolean)
                                    })}
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            {[
                                { label: "TITLE", value: job.result.title },
                                { label: "CATEGORY", value: job.result.category },
                                { label: "SUMMARY", value: job.result.summary },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <div style={{ fontSize: "0.7rem", letterSpacing: "1px", color: "#475569", marginBottom: "0.2rem" }}>{label}</div>
                                    <div style={{ color: "#e2e8f0" }}>{value}</div>
                                </div>
                            ))}
                            <div>
                                <div style={{ fontSize: "0.7rem", letterSpacing: "1px", color: "#475569", marginBottom: "0.4rem" }}>KEYWORDS</div>
                                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                    {job.result.keywords?.map((k, i) => (
                                        <span key={i} style={{
                                            background: "#1e293b", color: "#38bdf8",
                                            padding: "0.2rem 0.6rem", fontSize: "0.75rem", letterSpacing: "1px"
                                        }}>{k}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card" style={{ color: "#475569", textAlign: "center", padding: "2rem" }}>
                    {job.status === "queued" ? "⏳ Waiting to process..." :
                        job.status === "processing" ? "⚙️ Processing document..." :
                            job.status === "failed" ? "✗ Processing failed" :
                                "No result available"}
                </div>
            )}

            {/* Raw JSON */}
            {job.result && (
                <div className="card" style={{ marginTop: "1rem" }}>
                    <div style={{ fontSize: "0.75rem", letterSpacing: "2px", color: "#475569", marginBottom: "0.8rem" }}>RAW JSON</div>
                    <pre style={{ color: "#4ade80", fontSize: "0.75rem", overflowX: "auto", background: "#060609", padding: "1rem" }}>
                        {JSON.stringify(job.result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}