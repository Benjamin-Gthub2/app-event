import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './Register.css';

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

interface RegisterProps {
    onShowLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onShowLogin }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const { theme, toggleTheme } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            onShowLogin();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear usuario.');
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
                    <h2 className="login-title">Registro de Usuario</h2>
                    <p className="login-subtitle">Ingresar credenciales</p>
                </header>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <p className="login-error">{error}</p>}

                    <div className="form-group">
                        <label htmlFor="username">DNI, CE/PASSPORT</label>
                        <input
                            id="username"
                            type="text"
                            // placeholder="ejemplo@ppln.pe"
                            placeholder="00000000"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Nombres</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Ingrese su nombre completo"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Apellido Paterno</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Ingrese su Apellido Paterno"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Apellido Materno</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Ingrese su Apellido Materno"
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
                            placeholder="Ingrese una contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Confirmar Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Confirme su contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Cargando...' : 'Registrar'}
                    </button>
                </form>

                <footer className="login-footer">
                    <button type="button" className="link-button" onClick={onShowLogin}>¿Ya tienes cuenta? Inicia sesión</button>
                </footer>
            </div>
        </div>
    );
};

export default Register;
