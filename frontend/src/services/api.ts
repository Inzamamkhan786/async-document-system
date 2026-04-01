import { authService } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Authorization": `Bearer ${authService.getToken() ?? ""}`,
});

export interface Job {
  id: number;
  filename: string;
  status: "queued" | "processing" | "completed" | "failed" | "finalized";
  result: {
    title: string;
    category: string;
    summary: string;
    keywords: string[];
  } | null;
  created_at: string;
  user_id: number;
}

export interface ProgressEvent {
  job_id: number;
  event: string;
  message: string;
}

export const api = {
  uploadFile: async (file: File): Promise<{ job_id: number }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },

  getJobs: async (): Promise<Job[]> => {
    const res = await fetch(`${BASE_URL}/jobs`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json();
  },

  getJob: async (id: number): Promise<Job> => {
    const res = await fetch(`${BASE_URL}/jobs/${id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Job not found");
    return res.json();
  },

  updateJob: async (id: number, result: Job["result"]): Promise<Job> => {
    const res = await fetch(`${BASE_URL}/jobs/${id}`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
    });
    return res.json();
  },

  finalizeJob: async (id: number): Promise<Job> => {
    const res = await fetch(`${BASE_URL}/jobs/${id}/finalize`, {
      method: "POST", headers: authHeaders(),
    });
    return res.json();
  },

  retryJob: async (id: number): Promise<{ job_id: number }> => {
    const res = await fetch(`${BASE_URL}/jobs/${id}/retry`, {
      method: "POST", headers: authHeaders(),
    });
    return res.json();
  },

  exportJSON: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/jobs/${id}/export?format=json`, {
      headers: authHeaders(),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `job_${id}.json`; a.click();
    URL.revokeObjectURL(url);
  },

  exportCSV: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/jobs/${id}/export?format=csv`, {
      headers: authHeaders(),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `job_${id}.csv`; a.click();
    URL.revokeObjectURL(url);
  },

  subscribeProgress: (onEvent: (e: ProgressEvent) => void): EventSource => {
    const token = authService.getToken();
    const es = new EventSource(`${BASE_URL}/progress?token=${token}`);
    es.onmessage = (e) => onEvent(JSON.parse(e.data));
    return es;
  },
};
