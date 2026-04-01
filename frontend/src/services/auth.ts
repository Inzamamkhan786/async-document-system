const BASE_URL = "http://127.0.0.1:8000";

export interface AuthUser {
  user_id: number;
  username: string;
  email: string;
  access_token: string;
}

export const authService = {
  signup: async (email: string, username: string, password: string): Promise<AuthUser> => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Signup failed");
    }
    return res.json();
  },

  login: async (email: string, password: string): Promise<AuthUser> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }
    return res.json();
  },

  saveUser: (user: AuthUser) => {
    localStorage.setItem("docflow_user", JSON.stringify(user));
  },

  getUser: (): AuthUser | null => {
    const raw = localStorage.getItem("docflow_user");
    return raw ? JSON.parse(raw) : null;
  },

  logout: () => {
    localStorage.removeItem("docflow_user");
  },

  getToken: (): string | null => {
    const user = authService.getUser();
    return user?.access_token ?? null;
  },
};