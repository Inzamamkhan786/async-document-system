import { useState, useRef } from "react";
import { api } from "../services/api";

export default function UploadScreen({ onDone }: { onDone: () => void }) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<number[]>([]);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;
        setFiles((prev) => [...prev, ...Array.from(newFiles)]);
    };

    const removeFile = (i: number) =>
        setFiles((prev) => prev.filter((_, idx) => idx !== i));

    const handleUpload = async () => {
        setUploading(true);
        const ids: number[] = [];
        for (const file of files) {
            const res = await api.uploadFile(file);
            ids.push(res.job_id);
        }
        setResults(ids);
        setFiles([]);
        setUploading(false);
    };

    return (
        <div>
            <h1 style={{ fontSize: "1.4rem", letterSpacing: "3px", marginBottom: "2rem", color: "#38bdf8" }}>
                UPLOAD DOCUMENTS
            </h1>

            {results.length > 0 && (
                <div className="card" style={{ borderColor: "#4ade80", marginBottom: "1.5rem" }}>
                    <div style={{ color: "#4ade80", marginBottom: "0.5rem" }}>✓ Uploaded {results.length} file(s)</div>
                    {results.map((id) => (
                        <div key={id} style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Job #{id} queued</div>
                    ))}
                    <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={onDone}>
                        Go to Dashboard →
                    </button>
                </div>
            )}

            <div
                className="card"
                style={{
                    border: dragging ? "1px dashed #38bdf8" : "1px dashed #334155",
                    textAlign: "center", padding: "3rem", cursor: "pointer",
                    background: dragging ? "#0d1a2a" : "#0d0d14",
                    transition: "all 0.2s"
                }}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            >
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📄</div>
                <div style={{ color: "#94a3b8", letterSpacing: "1px" }}>
                    DROP FILES HERE or <span style={{ color: "#38bdf8" }}>CLICK TO BROWSE</span>
                </div>
                <input ref={inputRef} type="file" multiple style={{ display: "none" }}
                    onChange={(e) => addFiles(e.target.files)} />
            </div>

            {files.length > 0 && (
                <div className="card" style={{ marginTop: "1rem" }}>
                    <div style={{ marginBottom: "1rem", color: "#94a3b8", fontSize: "0.85rem", letterSpacing: "1px" }}>
                        {files.length} FILE(S) SELECTED
                    </div>
                    {files.map((f, i) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "0.5rem 0", borderBottom: "1px solid #1e293b"
                        }}>
                            <div>
                                <div style={{ color: "#e2e8f0" }}>{f.name}</div>
                                <div style={{ color: "#475569", fontSize: "0.75rem" }}>
                                    {(f.size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                            <button className="btn btn-danger" style={{ padding: "0.2rem 0.6rem" }}
                                onClick={() => removeFile(i)}>✕</button>
                        </div>
                    ))}
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: "1.5rem", width: "100%", padding: "0.8rem" }}
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? "UPLOADING..." : `UPLOAD ${files.length} FILE(S)`}
                    </button>
                </div>
            )}
        </div>
    );
}