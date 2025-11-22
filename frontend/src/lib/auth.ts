/**
 * Authentication Manager
 * Centralized auth management with persistent sessions
 */

interface AuthTokens {
    access_token: string;
    refresh_token?: string;
}

interface UserData {
    email: string;
    role: string;
    full_name?: string;
}

export const authManager = {
    /**
     * Save authentication tokens
     * @param tokens - Access and refresh tokens
     * @param userData - User information
     * @param rememberMe - Whether to persist session (7 days) or use session storage
     */
    saveAuth(tokens: AuthTokens, userData: UserData, rememberMe: boolean = true) {
        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem('access_token', tokens.access_token);
        if (tokens.refresh_token) {
            storage.setItem('refresh_token', tokens.refresh_token);
        }

        storage.setItem('user_email', userData.email);
        storage.setItem('user_role', userData.role);
        if (userData.full_name) {
            storage.setItem('user_name', userData.full_name);
        }

        if (rememberMe) {
            localStorage.setItem('remember_me', 'true');
        }
    },

    /**
     * Get access token from storage
     */
    getToken(): string | null {
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    },

    /**
     * Get refresh token from storage
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    },

    /**
     * Get user data from storage
     */
    getUserData(): UserData | null {
        const email = localStorage.getItem('user_email') || sessionStorage.getItem('user_email');
        const role = localStorage.getItem('user_role') || sessionStorage.getItem('user_role');
        const full_name = localStorage.getItem('user_name') || sessionStorage.getItem('user_name');

        if (!email || !role) return null;

        return {
            email,
            role,
            full_name: full_name || undefined,
        };
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    /**
     * Check if user has "remember me" enabled
     */
    hasRememberMe(): boolean {
        return localStorage.getItem('remember_me') === 'true';
    },

    /**
     * Clear all authentication data
     */
    logout() {
        // Clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        localStorage.removeItem('remember_me');

        // Clear sessionStorage
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user_email');
        sessionStorage.removeItem('user_role');
        sessionStorage.removeItem('user_name');
    },

    /**
     * Get user role
     */
    getUserRole(): string | null {
        return localStorage.getItem('user_role') || sessionStorage.getItem('user_role');
    },

    /**
     * Check if user is admin
     */
    isAdmin(): boolean {
        const role = this.getUserRole();
        return role === 'admin' || role === 'super';
    },
};
