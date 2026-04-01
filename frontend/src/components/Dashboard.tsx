import { useEffect, useState } from "react";
import { api, Job } from "../services/api";

export default function Dashboard({ onSelectJob }: { onSelectJob: (id: number) => void }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

    const fetchJobs = async () => {
        const data = await api.getJobs();
        setJobs(data);
    };

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 3000);
        return () => clearInterval(interval);
    }, []);

    const filtered = jobs
        .filter((j) => {
            const matchSearch = j.filename.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === "all" || j.status === statusFilter;
            return matchSearch && matchStatus;
        })
        .sort((a, b) => {
            const da = new Date(a.created_at).getTime();
            const db = new Date(b.created_at).getTime();
            return sortBy === "newest" ? db - da : da - db;
        });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.4rem", letterSpacing: "3px", color: "#38bdf8" }}>JOBS DASHBOARD</h1>
                <button className="btn" onClick={fetchJobs} style={{ fontSize: "0.75rem" }}>↻ REFRESH</button>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <input placeholder="SEARCH BY FILENAME..." value={search}
                    onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: "280px" }} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ maxWidth: "160px" }}>
                    <option value="all">ALL STATUS</option>
                    <option value="queued">QUEUED</option>
                    <option value="processing">PROCESSING</option>
                    <option value="completed">COMPLETED</option>
                    <option value="failed">FAILED</option>
                    <option value="finalized">FINALIZED</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                    style={{ maxWidth: "140px" }}>
                    <option value="newest">NEWEST</option>
                    <option value="oldest">OLDEST</option>
                </select>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {["queued", "processing", "completed", "failed"].map((s) => (
                    <div key={s} className="card" style={{ flex: "1", minWidth: "100px", padding: "1rem", textAlign: "center" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                            {jobs.filter(j => j.status === s).length}
                        </div>
                        <div style={{ fontSize: "0.7rem", letterSpacing: "1px", color: "#475569", marginTop: "0.2rem" }}>
                            {s.toUpperCase()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Job list */}
            {filtered.length === 0 ? (
                <div className="card" style={{ textAlign: "center", color: "#475569", padding: "3rem" }}>
                    No jobs found
                </div>
            ) : (
                filtered.map((job) => (
                    <div key={job.id} className="card" style={{ cursor: "pointer", transition: "border-color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#334155")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e293b")}
                        onClick={() => onSelectJob(job.id)}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.4rem" }}>
                                    <span style={{ color: "#475569", fontSize: "0.75rem" }}>#{job.id}</span>
                                    <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{job.filename}</span>
                                    <span className={`badge badge-${job.status}`}>{job.status}</span>
                                </div>
                                <div style={{ color: "#475569", fontSize: "0.75rem" }}>
                                    {new Date(job.created_at).toLocaleString()}
                                </div>
                                {job.result && (
                                    <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.4rem" }}>
                                        {job.result.title} · {job.result.category}
                                    </div>
                                )}
                            </div>
                            <span style={{ color: "#475569", fontSize: "1.2rem" }}>→</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}