import { useEffect, useState, useRef } from "react";
import { api, ProgressEvent } from "../services/api";

export default function ProgressMonitor() {
    const [events, setEvents] = useState<(ProgressEvent & { ts: string })[]>([]);
    const [open, setOpen] = useState(true);
    const esRef = useRef<EventSource | null>(null);

    useEffect(() => {
        const es = api.subscribeProgress((e) => {
            const ts = new Date().toLocaleTimeString();
            setEvents((prev) => [{ ...e, ts }, ...prev].slice(0, 50));
        });
        esRef.current = es;
        return () => es.close();
    }, []);

    return (
        <div className="progress-monitor">
            <div className="progress-header" onClick={() => setOpen(!open)}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div className="dot" />
                    <span style={{ fontSize: "0.8rem", letterSpacing: "1px" }}>LIVE PROGRESS</span>
                </div>
                <span style={{ color: "#475569", fontSize: "0.75rem" }}>
                    {events.length} events {open ? "▼" : "▲"}
                </span>
            </div>
            {open && (
                <div className="progress-events">
                    {events.length === 0 && (
                        <div className="progress-event" style={{ color: "#475569" }}>
                            Waiting for jobs...
                        </div>
                    )}
                    {events.map((e, i) => (
                        <div className="progress-event" key={i}>
                            <span className="ev-time">{e.ts}</span>
                            <span className="ev-job">#{e.job_id}</span>
                            <span className="ev-name">{e.event}</span>
                            <span className="ev-msg">{e.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}