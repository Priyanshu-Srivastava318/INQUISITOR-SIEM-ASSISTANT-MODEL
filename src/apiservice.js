// API Service - Environment-aware Backend Connection
// Automatically detects local vs deployed environment

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'  // Local development
    : 'https://inquisitor-siem-assistant-model.onrender.com/api';  // Production

const HEALTH_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/health'
    : 'https://inquisitor-siem-assistant-model.onrender.com/health';

class APIService {
    constructor() {
        this.token = localStorage.getItem('jwt_token');
        console.log('🔗 API URL:', API_URL);  // Debug log
    }

    // Get headers with authentication
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Authentication APIs
    async register(name, email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                localStorage.setItem('jwt_token', data.token);
                localStorage.setItem('inquisitor_user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'Network error' };
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                localStorage.setItem('jwt_token', data.token);
                localStorage.setItem('inquisitor_user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error' };
        }
    }

    async logout() {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: this.getHeaders()
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.token = null;
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('inquisitor_user');
        }
    }

    async getCurrentUser() {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: this.getHeaders()
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get user error:', error);
            return { success: false };
        }
    }

    // Threat APIs
    async getThreats(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_URL}/threats?${queryString}`, {
                headers: this.getHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get threats error:', error);
            return { success: false, threats: [] };
        }
    }

    async getThreatStats(hours = 24) {
        try {
            const response = await fetch(`${API_URL}/threats/stats?hours=${hours}`, {
                headers: this.getHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get stats error:', error);
            return { success: false };
        }
    }

    async blockIP(threatId) {
        try {
            const response = await fetch(`${API_URL}/threats/${threatId}/block`, {
                method: 'POST',
                headers: this.getHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Block IP error:', error);
            return { success: false, message: 'Failed to block IP' };
        }
    }

    async resolveThreat(threatId, notes) {
        try {
            const response = await fetch(`${API_URL}/threats/${threatId}/resolve`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ notes })
            });

            return await response.json();
        } catch (error) {
            console.error('Resolve threat error:', error);
            return { success: false, message: 'Failed to resolve threat' };
        }
    }

    // Chat APIs
    async sendChatQuery(query) {
        try {
            const response = await fetch(`${API_URL}/chat/query`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ query })
            });

            return await response.json();
        } catch (error) {
            console.error('Chat query error:', error);
            return { 
                success: false, 
                response: { 
                    type: 'error', 
                    content: 'Unable to process query. Please check backend connection.' 
                }
            };
        }
    }

    // Check if backend is reachable
    async checkBackendHealth() {
        try {
            const response = await fetch(HEALTH_URL);
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Backend health check failed:', error);
            return false;
        }
    }
}

// Export singleton instance
const apiService = new APIService();

// Make it globally available
if (typeof window !== 'undefined') {
    window.APIService = apiService;
}