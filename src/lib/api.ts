
const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

async function request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("auth_token");
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    } as HeadersInit;

    if (token) {
        (headers as any)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.reload();
    }

    return response;
}

export const api = {
    get: (endpoint: string) => request(endpoint, { method: "GET" }),
    post: (endpoint: string, body: any) => request(endpoint, { method: "POST", body: JSON.stringify(body) }),
    put: (endpoint: string, body: any) => request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    patch: (endpoint: string, body: any) => request(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (endpoint: string) => request(endpoint, { method: "DELETE" }),
};
