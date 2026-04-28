import { useState, useEffect, useCallback } from 'react';
import './TalleresPage.css';
import { workshopService } from '../services/workshopService';
import type { WorkshopSums } from '../types/workshop.types';
import { useMqttWorkshops } from '../hooks/useMqttWorkshops';
import { useMqttRegistrations } from '../hooks/useMqttRegistrations';

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

// ── Mock times (hora a confirmar) ──────────────────────────────────────────────

const MOCK_TIMES = [
    '08:00 – 10:00',
    '09:00 – 11:00',
    '10:00 – 12:00',
    '11:00 – 13:00',
    '14:00 – 16:00',
    '15:00 – 17:00',
    '16:00 – 18:00',
    '08:30 – 10:30',
];

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

function computeStats(workshops: WorkshopSums[]) {
    const totalInscritos = workshops.reduce((s, w) => s + (w.total_registrations ?? 0), 0);
    const totalCapacity  = workshops.reduce((s, w) => s + (w.capacity ?? 0), 0);
    const llenos    = workshops.filter((w) => (w.total_registrations ?? 0) >= (w.capacity ?? 1)).length;
    const conCupos  = workshops.filter((w) => (w.total_registrations ?? 0) < (w.capacity ?? 1)).length;
    const pctOcupacion = totalCapacity > 0 ? Math.round((totalInscritos / totalCapacity) * 100) : 0;
    return { totalInscritos, conCupos, llenos, pctOcupacion, totalCapacity };
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TalleresPage() {
    const [theme, setTheme] = useState<'light' | 'dark'>(getThemeFromStorage);
    const [now, setNow] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [workshops, setWorkshops] = useState<WorkshopSums[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await workshopService.getWorkshopSummary();
            setWorkshops(res.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar resumen de talleres:', err);
            setError('No se pudo cargar la información de talleres');
        } finally {
            setLoading(false);
        }
    }, []);

    const { connected: mqttConnected } = useMqttWorkshops(fetchData);
    useMqttRegistrations(fetchData);

    // Sync theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Clock ticker
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    const stats = computeStats(workshops);

    const tickerItems = [
        `Talleres Disponibles: ${stats.conCupos}`,
        `Talleres Llenos: ${stats.llenos}`,
        `Ocupación General: ${stats.pctOcupacion}%`,
        `Total Inscritos: ${stats.totalInscritos}`,
        `Capacidad Total: ${stats.totalCapacity}`,
        `Talleres Disponibles: ${stats.conCupos}`,
        `Talleres Llenos: ${stats.llenos}`,
        `Ocupación General: ${stats.pctOcupacion}%`,
        mqttConnected ? `🟢 EN VIVO` : `🔴 SIN CONEXIÓN`,
        `Última actualización: ${formatClock(now)}`,
    ];

    return (
        <div className="tal-page">
            {/* ── Top bar ── */}
            <header className="tal-topbar">
                <div className="tal-brand">
                    <div className="tal-brand-badge">PP</div>
                    <div>
                        <div className="tal-brand-name">CUMBRE PPLN 2026</div>
                        <div className="tal-brand-sub">Disponibilidad de Talleres</div>
                    </div>
                </div>

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

                <div className="tal-controls">
                    <div className={`tal-live-badge${mqttConnected ? '' : ' tal-live-badge--off'}`}>
                        <span className="tal-live-dot" />
                        {mqttConnected ? 'EN VIVO' : 'SIN CONEXIÓN'}
                    </div>
                    <div className="tal-clock">
                        <div className="tal-clock-time">{formatClock(now)}</div>
                        <div className="tal-clock-date">{formatDateFull(now)}</div>
                    </div>
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
                {loading ? (
                    <div className="tal-state-msg">Cargando talleres…</div>
                ) : error ? (
                    <div className="tal-state-msg tal-state-msg--error">{error}</div>
                ) : workshops.length === 0 ? (
                    <div className="tal-state-msg">No hay talleres registrados.</div>
                ) : (
                    <div className="tal-grid">
                        {workshops.map((w, i) => {
                            const capacity  = w.capacity ?? 0;
                            const inscritos = w.total_registrations ?? 0;
                            const status    = getAvailStatus(capacity, inscritos);
                            const pct       = capacity > 0 ? Math.min(100, Math.round((inscritos / capacity) * 100)) : 0;
                            const available = Math.max(0, capacity - inscritos);
                            const time      = MOCK_TIMES[i % MOCK_TIMES.length];

                            return (
                                <div key={w.id ?? i} className="tal-card">
                                    {/* Tags */}
                                    <div className="tal-card-tags">
                                        <span className={`tal-avail-badge tal-avail-badge--${status}`}>
                                            <span className="tal-avail-dot" />
                                            {status === 'full' ? 'LLENO' : status === 'almost' ? 'CASI LLENO' : 'DISPONIBLE'}
                                        </span>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <p className="tal-card-name">{w.name ?? 'Taller'}</p>
                                        <p className="tal-card-meta">{time}</p>
                                    </div>

                                    {/* Numbers */}
                                    <div className="tal-numbers">
                                        <div className="tal-num-block">
                                            <span className="tal-num-value tal-num-value--default">{capacity}</span>
                                            <span className="tal-num-label">Capacidad</span>
                                        </div>
                                        <div className="tal-num-block">
                                            <span className="tal-num-value tal-num-value--accent">{inscritos}</span>
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
                )}
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
