export interface StoredUser {
    _id?: string;
    id?: string;
    role?: string;
    canAccessDashboard?: boolean;
    studentId?: string;
    enrolledHostelId?: string;
}

export const AUTH_CHANGED_EVENT = 'hostelhub:auth-changed';

export function getStoredUser(): StoredUser | null {
    if (typeof window === 'undefined') return null;

    const raw = localStorage.getItem('user');
    if (!raw) return null;

    try {
        return JSON.parse(raw) as StoredUser;
    } catch {
        return null;
    }
}

export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

export function getAuthSession(): { token: string | null; user: StoredUser | null } {
    return {
        token: getAuthToken(),
        user: getStoredUser()
    };
}

export function setAuthSession(token: string, user: StoredUser) {
    if (typeof window === 'undefined') return;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: { user } }));
}

export function clearAuthSession() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: { user: null } }));
}

export function getAuthHeaders(headers: Record<string, string> = {}) {
    const token = getAuthToken();
    if (!token) return headers;

    return {
        ...headers,
        Authorization: `Bearer ${token}`,
    };
}
