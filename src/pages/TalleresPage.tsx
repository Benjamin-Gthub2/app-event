import { useState, useEffect } from 'react';
import './TalleresPage.css';

// ── Icons ──────────────────────────────────────────────────────────────────────

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

const IconFullscreen = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);

const IconExitFullscreen = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
        <line x1="10" y1="14" x2="3" y2="21" /><line x1="21" y1="3" x2="14" y2="10" />
    </svg>
);

// ── Mock data ──────────────────────────────────────────────────────────────────

interface TallerItem {
    id: number;
    category: string;
    code: string;
    name: string;
    date: string;
    time: string;
    capacity: number;
    inscritos: number;
}

const TALLERES: TallerItem[] = [
    { id: 1, category: 'LIDERAZGO',    code: 'LGE-01', name: 'Liderazgo y Gestión de Equipos',           date: '26 Abr', time: '09:00 – 11:00', capacity: 100, inscritos: 71 },
    { id: 2, category: 'TECNOLOGÍA',   code: 'ITD-02', name: 'Innovación y Transformación Digital',       date: '26 Abr', time: '10:30 – 12:30', capacity: 80,  inscritos: 80 },
    { id: 3, category: 'COMUNICACIÓN', code: 'CE-03',  name: 'Comunicación Estratégica y Presentaciones', date: '26 Abr', time: '09:00 – 10:30', capacity: 60,  inscritos: 60 },
    { id: 4, category: 'FINANZAS',     code: 'FNF-04', name: 'Finanzas para No Financieros',              date: '26 Abr', time: '11:00 – 13:00', capacity: 50,  inscritos: 24 },
    { id: 5, category: 'HABILIDADES',  code: 'DHB-05', name: 'Desarrollo de Habilidades Blandas',         date: '26 Abr', time: '14:00 – 16:00', capacity: 90,  inscritos: 88 },
    { id: 6, category: 'GESTIÓN',      code: 'GPA-06', name: 'Gestión de Proyectos Ágil (Scrum)',         date: '26 Abr', time: '15:00 – 17:00', capacity: 70,  inscritos: 44 },
    { id: 7, category: 'MARKETING',    code: 'MRS-07', name: 'Marketing Digital y Redes Sociales',        date: '26 Abr', time: '09:00 – 11:00', capacity: 65,  inscritos: 65 },
    { id: 8, category: 'VENTAS',       code: 'NE-08',  name: 'Negociación y Cierre Efectivo',             date: '26 Abr', time: '13:00 – 15:00', capacity: 45,  inscritos: 22 },
];

const REFRESH_SECS = 30;

// ── Helpers ────────────────────────────────────────────────────────────────────

function getAvailStatus(capacity: number, inscritos: number): 'available' | 'full' | 'almost' {
    const pct = inscritos / capacity;
    if (pct >= 1) return 'full';
    if (pct >= 0.9) return 'almost';
    return 'available';
}

function getProgressClass(status: 'available' | 'full' | 'almost') {
    if (status === 'full') return 'tal-progress-fill--red';
    if (status === 'almost') return 'tal-progress-fill--orange';
    return 'tal-progress-fill--green';
}

function getThemeFromStorage(): 'light' | 'dark' {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function formatClock(d: Date) {
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

function formatDateFull(d: Date) {
    return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Derived stats ──────────────────────────────────────────────────────────────

function computeStats(talleres: TallerItem[]) {
    const totalInscritos = talleres.reduce((s, t) => s + t.inscritos, 0);
    const totalCapacity  = talleres.reduce((s, t) => s + t.capacity, 0);
    const llenos = talleres.filter((t) => t.inscritos >= t.capacity).length;
    const conCupos = talleres.filter((t) => t.inscritos < t.capacity).length;
    const pctOcupacion = totalCapacity > 0 ? Math.round((totalInscritos / totalCapacity) * 100) : 0;
    return { totalInscritos, conCupos, llenos, pctOcupacion };
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TalleresPage() {
    const [theme, setTheme] = useState<'light' | 'dark'>(getThemeFromStorage);
    const [now, setNow] = useState(new Date());
    const [countdown, setCountdown] = useState(REFRESH_SECS);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Sync theme to document (same key the rest of the app uses)
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Clock ticker
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    // Refresh countdown
    useEffect(() => {
        const id = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) return REFRESH_SECS;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const stats = computeStats(TALLERES);

    // Build ticker text (duplicated for infinite scroll illusion)
    const tickerItems = [
        `Talleres Disponibles: ${stats.conCupos}`,
        `Talleres Llenos: ${stats.llenos}`,
        `Ocupación General: ${stats.pctOcupacion}%`,
        `Total Inscritos: ${stats.totalInscritos}`,
        `Capacidad Total: ${TALLERES.reduce((s, t) => s + t.capacity, 0)}`,
        `Talleres Disponibles: ${stats.conCupos}`,
        `Talleres Llenos: ${stats.llenos}`,
        `Ocupación General: ${stats.pctOcupacion}%`,
        `🟢 TRANSMISIÓN EN VIVO`,
        `Última actualización: ${formatClock(now)}`,
    ];

    return (
        <div className="tal-page">
            {/* ── Top bar ── */}
            <header className="tal-topbar">
                {/* Brand */}
                <div className="tal-brand">
                    <div className="tal-brand-badge">PP</div>
                    <div>
                        <div className="tal-brand-name">CUMBRE PPLN 2026</div>
                        <div className="tal-brand-sub">Disponibilidad de Talleres</div>
                    </div>
                </div>

                {/* Global stats */}
                <div className="tal-global-stats">
                    <div className="tal-gstat">
                        <span className="tal-gstat-num tal-gstat-num--teal">{stats.totalInscritos}</span>
                        <span className="tal-gstat-label">Inscritos</span>
                    </div>
                    <div className="tal-gstat">
                        <span className="tal-gstat-num tal-gstat-num--green">{stats.conCupos}</span>
                        <span className="tal-gstat-label">Con cupos</span>
                    </div>
                    <div className="tal-gstat">
                        <span className="tal-gstat-num tal-gstat-num--red">{stats.llenos}</span>
                        <span className="tal-gstat-label">Llenos</span>
                    </div>
                    <div className="tal-gstat">
                        <span className="tal-gstat-num tal-gstat-num--orange">{stats.pctOcupacion}%</span>
                        <span className="tal-gstat-label">Ocupación</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="tal-controls">
                    <div className="tal-live-badge">
                        <span className="tal-live-dot" />
                        EN VIVO
                    </div>
                    <div className="tal-clock">
                        <div className="tal-clock-time">{formatClock(now)}</div>
                        <div className="tal-clock-date">{formatDateFull(now)}</div>
                    </div>
                    <div className="tal-refresh-badge" title={`Actualiza en ${countdown}s`}>{countdown}</div>
                    <button className="tal-icon-btn" onClick={toggleTheme} title="Cambiar tema">
                        {theme === 'light' ? <IconMoon /> : <IconSun />}
                    </button>
                    <button className="tal-icon-btn" onClick={toggleFullscreen} title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
                        {isFullscreen ? <IconExitFullscreen /> : <IconFullscreen />}
                    </button>
                </div>
            </header>

            {/* ── Grid ── */}
            <div className="tal-content">
                <div className="tal-grid">
                    {TALLERES.map((t) => {
                        const status = getAvailStatus(t.capacity, t.inscritos);
                        const pct = Math.min(100, Math.round((t.inscritos / t.capacity) * 100));
                        const available = t.capacity - t.inscritos;

                        return (
                            <div key={t.id} className="tal-card" data-cat={t.category}>
                                {/* Tags */}
                                <div className="tal-card-tags">
                                    <span className="tal-cat-badge" data-cat={t.category}>{t.category}</span>
                                    <span className={`tal-avail-badge tal-avail-badge--${status}`}>
                                        <span className="tal-avail-dot" />
                                        {status === 'full' ? 'LLENO' : status === 'almost' ? 'CASI LLENO' : 'DISPONIBLE'}
                                    </span>
                                </div>

                                {/* Name */}
                                <div>
                                    <p className="tal-card-name">{t.name}</p>
                                    <p className="tal-card-meta">{t.code} &bull; {t.date} &bull; {t.time}</p>
                                </div>

                                {/* Numbers */}
                                <div className="tal-numbers">
                                    <div className="tal-num-block">
                                        <span className="tal-num-value tal-num-value--default">{t.capacity}</span>
                                        <span className="tal-num-label">Capacidad</span>
                                    </div>
                                    <div className="tal-num-block">
                                        <span className="tal-num-value tal-num-value--accent">{t.inscritos}</span>
                                        <span className="tal-num-label">Inscritos</span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="tal-progress-wrap">
                                    <span className="tal-progress-label">{pct}% ocupado</span>
                                    <div className="tal-progress-bar">
                                        <div
                                            className={`tal-progress-fill ${getProgressClass(status)}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className={`tal-progress-spots ${available > 0 ? 'tal-progress-spots--ok' : 'tal-progress-spots--none'}`}>
                                        {available > 0
                                            ? `${available} cupo${available !== 1 ? 's' : ''} disponible${available !== 1 ? 's' : ''}`
                                            : 'Sin cupos disponibles'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Footer ticker ── */}
            <footer className="tal-footer">
                <div className="tal-ticker-track">
                    {[...tickerItems, ...tickerItems].map((item, i) => (
                        <span key={i} className="tal-ticker-item">
                            {item.includes('TRANSMISIÓN') ? (
                                <span className="tal-ticker-live">{item}</span>
                            ) : (
                                <>
                                    {item.split(':')[0]}:{' '}
                                    <span>{item.split(':').slice(1).join(':').trim()}</span>
                                </>
                            )}
                        </span>
                    ))}
                </div>
            </footer>
        </div>
    );
}
