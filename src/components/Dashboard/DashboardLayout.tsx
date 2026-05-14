import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './DashboardLayout.css';

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconDashboard = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);

const IconQr = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" />
        <rect x="3" y="16" width="5" height="5" />
        <path d="M21 16h-3v3" /><path d="M21 21v-1" /><path d="M16 21h1" />
        <path d="M12 3v5" /><path d="M12 12v1" /><path d="M12 16v1" />
        <path d="M3 12h5" /><path d="M12 12h1" /><path d="M16 12h5" />
    </svg>
);

const IconUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconAccess = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
);

const IconReport = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const IconTalleres = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

const IconSettings = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const IconSearch = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const IconBell = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const IconSun = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const IconMoon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const IconChevron = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const IconLogout = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const IconMenu = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const IconUser = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

// ── Nav items ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard, path: '/dashboard' },
    { id: 'asistentes', label: 'Inscripciones', Icon: IconUsers, path: '/asistentes' },
    { id: 'qr-scanner', label: 'Escáner QR', Icon: IconQr, path: '/qr-scanner' },
    { id: 'accesos', label: 'Control de Asistencia', Icon: IconAccess, path: '/accesos' },
    { id: 'talleres', label: 'Talleres', Icon: IconTalleres, path: '/talleres' },
    { id: 'reportes', label: 'Reportes', Icon: IconReport, path: '/reportes' },
    { id: 'configuracion', label: 'Configuración', Icon: IconSettings, path: '/configuracion' },
];

// ── Component ──────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
    fullBleed?: boolean;
}

export default function DashboardLayout({ children, title = 'Inicio', fullBleed = false }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { logout, views, person } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const allowedPaths = new Set(views.map(v => v.url));
    const visibleNavItems = NAV_ITEMS.filter(
        item => item.path === '/dashboard' || allowedPaths.has(item.path),
    );

    const displayName = person
        ? [person.names, person.surname, person.last_name].filter(Boolean).join(' ').trim() || 'Usuario'
        : 'Usuario';

    const initials = [person?.names, person?.surname]
        .map(s => s?.trim()[0]?.toUpperCase() ?? '')
        .join('') || 'U';
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        setUserMenuOpen(false);
        logout();
        navigate('/');
    };

    const handleNav = (path: string) => {
        navigate(path);
        setSidebarOpen(false);
    };

    const profileModal = profileOpen && createPortal(
        <div className="dbl-pm-overlay" onClick={() => setProfileOpen(false)}>
            <div className="dbl-pm-card" onClick={e => e.stopPropagation()}>
                <button className="dbl-pm-close" onClick={() => setProfileOpen(false)} aria-label="Cerrar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="dbl-pm-avatar">{initials}</div>
                <h2 className="dbl-pm-name">{displayName}</h2>

                <div className="dbl-pm-fields">
                    {person?.document && (
                        <div className="dbl-pm-field">
                            <span className="dbl-pm-field-label">Documento</span>
                            <span className="dbl-pm-field-value">{person.document}</span>
                        </div>
                    )}
                    {person?.phone && (
                        <div className="dbl-pm-field">
                            <span className="dbl-pm-field-label">Teléfono</span>
                            <span className="dbl-pm-field-value">{person.phone}</span>
                        </div>
                    )}
                    {person?.email && (
                        <div className="dbl-pm-field">
                            <span className="dbl-pm-field-label">Correo</span>
                            <span className="dbl-pm-field-value">{person.email}</span>
                        </div>
                    )}
                    {person?.gender && (
                        <div className="dbl-pm-field">
                            <span className="dbl-pm-field-label">Género</span>
                            <span className="dbl-pm-field-value">{person.gender}</span>
                        </div>
                    )}
                    {!person?.document && !person?.phone && !person?.email && (
                        <p className="dbl-pm-empty">Sin datos adicionales registrados</p>
                    )}
                </div>

                <button className="dbl-pm-btn-close" onClick={() => setProfileOpen(false)}>
                    Cerrar
                </button>
            </div>
        </div>,
        document.body,
    );

    return (
        <div className="dbl-wrapper">
            {profileModal}
            {sidebarOpen && (
                <div className="dbl-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar ── */}
            <aside className={`dbl-sidebar ${sidebarOpen ? 'dbl-sidebar--open' : ''}`}>
                <div className="dbl-logo">
                    <div className="dbl-logo-badge">PP</div>
                    <div className="dbl-logo-text">
                        <span className="dbl-logo-title">PPLN</span>
                        <span className="dbl-logo-sub">Cumbre 2026</span>
                    </div>
                </div>

                <nav className="dbl-nav">
                    <ul>
                        {visibleNavItems.map(({ id, label, Icon, path }) => {
                            const active = location.pathname === path;

                            return (
                                <li key={id}>
                                    <button
                                        className={`dbl-nav-item ${active ? 'dbl-nav-item--active' : ''}`}
                                        onClick={() => handleNav(path)}
                                        title={label}
                                    >
                                        <span className="dbl-nav-icon"><Icon /></span>
                                        <span className="dbl-nav-label">{label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/*<div className="dbl-help">*/}
                {/*    <p className="dbl-help-title">¿Necesitas ayuda?</p>*/}
                {/*    <p className="dbl-help-desc">Consulta nuestra documentación</p>*/}
                {/*    <button className="dbl-help-btn">DOCUMENTACIÓN</button>*/}
                {/*</div>*/}
            </aside>

            {/* ── Main ── */}
            <div className="dbl-main">
                {/* Header */}
                <header className="dbl-header">
                    <div className="dbl-header-left">
                        <button
                            className="dbl-menu-btn"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Abrir menú"
                        >
                            <IconMenu />
                        </button>
                        <h1 className="dbl-page-title">{title}</h1>
                    </div>

                    <div className="dbl-header-right">
                        <button className="dbl-icon-btn" aria-label="Buscar">
                            <IconSearch />
                        </button>
                        <button className="dbl-icon-btn dbl-icon-btn--bell" aria-label="Notificaciones">
                            <IconBell />
                            <span className="dbl-badge">3</span>
                        </button>
                        <button
                            className="dbl-icon-btn"
                            onClick={toggleTheme}
                            aria-label="Cambiar tema"
                        >
                            {theme === 'light' ? <IconMoon /> : <IconSun />}
                        </button>

                        <div className="dbl-user-wrap">
                            <button
                                className="dbl-user-btn"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div className="dbl-user-avatar">
                                    {initials}
                                </div>
                                <div className="dbl-user-info">
                                    <span className="dbl-user-name">{displayName}</span>
                                </div>
                                <span className={`dbl-chevron ${userMenuOpen ? 'dbl-chevron--up' : ''}`}>
                                    <IconChevron />
                                </span>
                            </button>

                            {userMenuOpen && (
                                <div className="dbl-dropdown">
                                    <button
                                        className="dbl-dropdown-item"
                                        onClick={() => { setUserMenuOpen(false); setProfileOpen(true); }}
                                    >
                                        <IconUser /> Ver Perfil
                                    </button>
                                    <div className="dbl-dropdown-divider" />
                                    <button
                                        className="dbl-dropdown-item dbl-dropdown-item--danger"
                                        onClick={handleLogout}
                                    >
                                        <IconLogout /> Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className={`dbl-content${fullBleed ? ' dbl-content--full-bleed' : ''}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}