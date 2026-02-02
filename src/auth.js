// Authentication System - Backend Connected
const Auth = {
    getCurrentUser() {
        const user = localStorage.getItem('inquisitor_user');
        return user ? JSON.parse(user) : null;
    },

    async login(email, password) {
        try {
            const result = await window.APIService.login(email, password);
            return result;
        } catch (error) {
            return { success: false, error: 'Login failed' };
        }
    },

    async signup(name, email, password) {
        try {
            const result = await window.APIService.register(name, email, password);
            return result;
        } catch (error) {
            return { success: false, error: 'Signup failed' };
        }
    },

    async logout() {
        await window.APIService.logout();
        window.location.href = 'login.html';
    },

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
        }
    }
};