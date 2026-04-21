import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Login.css';

const SunIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

interface LoginProps {
    onShowRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onShowRegister }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login({ username, password });
            login(response.data);
            // navigate('/dashboard');
            navigate('/qr-scanner');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
                    title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>

                <header className="login-header">
                    <h2 className="login-title">Iniciar Sesión</h2>
                    <p className="login-subtitle">Ingresa tus credenciales para acceder</p>
                </header>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <p className="login-error">{error}</p>}

                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <input
                            id="username"
                            type="text"
                            // placeholder="ejemplo@ppln.pe"
                            placeholder="DNI. 00000000"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Cargando...' : 'Entrar'}
                    </button>
                </form>

                <footer className="login-footer">
                    <button type="button" className="link-button" onClick={onShowRegister}>Crear Usuario</button>
                </footer>

                <footer className="login-footer">
                    <a href="/recuperar">¿Olvidaste tu contraseña?</a>
                </footer>
            </div>
        </div>
    );
};

export default Login;
