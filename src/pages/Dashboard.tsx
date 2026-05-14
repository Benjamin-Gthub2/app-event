import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import './Dashboard.css';

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconQr = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" />
        <rect x="3" y="16" width="5" height="5" />
        <path d="M21 16h-3v3" /><path d="M21 21v-1" /><path d="M16 21h1" />
        <path d="M12 3v5" /><path d="M12 12v1" /><path d="M12 16v1" />
        <path d="M3 12h5" /><path d="M12 12h1" /><path d="M16 12h5" />
    </svg>
);

const IconUsers = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconAccess = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
);

const IconReport = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <rect x="2" y="2" width="20" height="20" rx="2" />
    </svg>
);

const IconWorkshop = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="10" y2="14" />
        <line x1="14" y1="14" x2="16" y2="14" />
        <line x1="8" y1="17" x2="10" y2="17" />
        <line x1="14" y1="17" x2="16" y2="17" />
    </svg>
);

const IconArrow = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

// ── Module definitions ─────────────────────────────────────────────────────────

const MODULES = [
    {
        id: 'qr',
        title: 'Escáner QR',
        description: 'Escanea los códigos QR  o la informacion de los asistentes para validar su acceso al taller.',
        icon: <IconQr />,
        path: '/qr-scanner',
        color: '#43b3c4',
        colorLight: '#e0f7fa',
        stat: '—',
        statLabel: 'en tiempo real',
    },
    {
        id: 'asistentes',
        title: 'Inscripciones',
        description: 'Consulta y gestiona la lista completa de las inscripciones registradas.',
        icon: <IconUsers />,
        path: '/asistentes',
        color: '#48bb78',
        colorLight: '#f0fff4',
        stat: '',
        statLabel: 'registrados',
    },
    {
        id: 'talleres',
        title: 'Talleres',
        description: 'Consulta la disponibilidad de talleres y cupos en tiempo real.',
        icon: <IconWorkshop />,
        path: '/talleres',
        color: '#4299e1',
        colorLight: '#ebf8ff',
        stat: '—',
        statLabel: 'en tiempo real',
    },
    {
        id: 'accesos',
        title: 'Control de Asistencia',
        description: 'Revisa los registros de entrada y salida del evento en tiempo real.',
        icon: <IconAccess />,
        path: '/accesos',
        color: '#ed8936',
        colorLight: '#fffaf0',
        stat: '',
        statLabel: 'accesos hoy',
    },
    {
        id: 'reportes',
        title: 'Reportes',
        description: 'Genera informes estadísticos de asistencia y participación del evento.',
        icon: <IconReport />,
        path: '/reportes',
        color: '#9f7aea',
        colorLight: '#faf5ff',
        stat: '',
        statLabel: 'reportes',
    },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <DashboardLayout title="Inicio">
            <div className="db-welcome">
                <h2 className="db-welcome-title">Bienvenido a Cumbre PPLN 2026</h2>
                <p className="db-welcome-sub">Selecciona un módulo para comenzar.</p>
            </div>

            <div className="db-grid">
                {MODULES.map((mod) => (
                    <button
                        key={mod.id}
                        className="db-card"
                        onClick={() => navigate(mod.path)}
                        style={{ '--card-color': mod.color, '--card-color-light': mod.colorLight } as React.CSSProperties}
                    >
                        <div className="db-card-icon">
                            {mod.icon}
                        </div>

                        <div className="db-card-body">
                            <h3 className="db-card-title">{mod.title}</h3>
                            <p className="db-card-desc">{mod.description}</p>
                        </div>

                        <div className="db-card-footer">
                            <div className="db-card-stat">
                                <span className="db-stat-value">{mod.stat}</span>
                                <span className="db-stat-label">{mod.statLabel}</span>
                            </div>
                            <span className="db-card-arrow"><IconArrow /></span>
                        </div>
                    </button>
                ))}
            </div>
        </DashboardLayout>
    );
}
