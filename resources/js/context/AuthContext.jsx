import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }

        try {
            const { data } = await client.get('/user');
            setUser(data.data);
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUser(); }, [fetchUser]);

    const login = async (email, password) => {
        const { data } = await client.post('/login', { email, password });
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        return data;
    };

    const register = async (name, email, password, password_confirmation) => {
        const { data } = await client.post('/register', { name, email, password, password_confirmation });
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        return data;
    };

    const logout = async () => {
        try { await client.post('/logout'); } catch {}
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
