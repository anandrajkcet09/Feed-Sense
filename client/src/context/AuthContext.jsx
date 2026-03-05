import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            // Check both storages
            const token = localStorage.getItem('feedsense_token') || sessionStorage.getItem('feedsense_token');
            const storedUser = localStorage.getItem('feedsense_user') || sessionStorage.getItem('feedsense_user');

            if (token && storedUser) {
                try {
                    const res = await axios.get('http://localhost:5000/api/auth/verify', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.valid) {
                        setUser(JSON.parse(storedUser));
                    }
                } catch (error) {
                    console.error("Token verification failed:", error);
                    localStorage.removeItem('feedsense_token');
                    localStorage.removeItem('feedsense_user');
                    sessionStorage.removeItem('feedsense_token');
                    sessionStorage.removeItem('feedsense_user');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkLoggedIn();

        // Setup global axios interceptor for unauthorized errors
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 || (error.response?.status === 400 && error.response.data?.message === 'Invalid Token')) {
                    localStorage.removeItem('feedsense_token');
                    localStorage.removeItem('feedsense_user');
                    sessionStorage.removeItem('feedsense_token');
                    sessionStorage.removeItem('feedsense_user');
                    setUser(null);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const login = async (email, password, rememberMe) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, user } = res.data;

            if (rememberMe) {
                localStorage.setItem('feedsense_token', token);
                localStorage.setItem('feedsense_user', JSON.stringify(user));
            } else {
                sessionStorage.setItem('feedsense_token', token);
                sessionStorage.setItem('feedsense_user', JSON.stringify(user));
            }

            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (fullName, email, password, rememberMe) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { fullName, email, password });
            const { token, user } = res.data;

            if (rememberMe) {
                localStorage.setItem('feedsense_token', token);
                localStorage.setItem('feedsense_user', JSON.stringify(user));
            } else {
                sessionStorage.setItem('feedsense_token', token);
                sessionStorage.setItem('feedsense_user', JSON.stringify(user));
            }

            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('feedsense_token');
        localStorage.removeItem('feedsense_user');
        sessionStorage.removeItem('feedsense_token');
        sessionStorage.removeItem('feedsense_user');
        setUser(null);
    };

    const getToken = () => {
        return localStorage.getItem('feedsense_token') || sessionStorage.getItem('feedsense_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, getToken, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
