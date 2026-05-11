import { useState, useEffect, useCallback, useRef } from 'react';
import './TalleresPage.css';
import { workshopService } from '../services/workshopService';
import type { WorkshopSums } from '../types/workshop.types';
import { useMqttWorkshops } from '../hooks/useMqttWorkshops';
import { useMqttRegistrations } from '../hooks/useMqttRegistrations';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { useTheme } from '../context/ThemeContext';

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

const IconPin = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
    </svg>
);

// ── Time options for filter selects (every 30 min, 00:00 → 23:59) ──────────────
const HALF_HOURS: string[] = (() => {
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
        for (const m of [0, 30]) {
            if (h === 23 && m === 30) continue;
            times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
    }
    times.push('23:59');
    return times;
})();

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

function formatClock(d: Date) {
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

function formatDateFull(d: Date) {
    return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function cap(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/\.$/, '');
}

function formatDayShort(isoDate: string): string {
    // avoid timezone shift: append T12:00 to interpret as local noon
    const d = new Date(`${isoDate}T12:00:00`);
    if (isNaN(d.getTime())) return isoDate;
    const wd  = d.toLocaleDateString('es-PE', { weekday: 'short' });
    const day = d.getDate();
    const mo  = d.toLocaleDateString('es-PE', { month: 'short' });
    return `${cap(wd)} ${day} ${cap(mo)}`;
}

function formatCardDate(iso: string | null): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const wd  = d.toLocaleDateString('es-PE', { weekday: 'short' });
    const day = d.getDate();
    const mo  = d.toLocaleDateString('es-PE', { month: 'short' });
    return `${cap(wd)} ${day} ${cap(mo)}`;
}

function fmtTime(iso: string | null): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function extractDays(workshops: WorkshopSums[]): string[] {
    const set = new Set<string>();
    for (const w of workshops) {
        if (w.start_date) set.add(w.start_date.substring(0, 10));
    }
    return Array.from(set).sort();
}

// ── Derived stats ──────────────────────────────────────────────────────────────

function computeStats(workshops: WorkshopSums[]) {
    const totalInscritos = workshops.reduce((s, w) => s + (w.total_presences ?? 0), 0);
    const totalCapacity  = workshops.reduce((s, w) => s + (w.capacity ?? 0), 0);
    const llenos    = workshops.filter((w) => (w.total_presences ?? 0) >= (w.capacity ?? 1)).length;
    const conCupos  = workshops.filter((w) => (w.total_presences ?? 0) < (w.capacity ?? 1)).length;
    const pctOcupacion = totalCapacity > 0 ? Math.round((totalInscritos / totalCapacity) * 100) : 0;
    return { totalInscritos, conCupos, llenos, pctOcupacion, totalCapacity };
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TalleresPage() {
    const { theme, toggleTheme } = useTheme();
    const [now, setNow] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [workshops, setWorkshops] = useState<WorkshopSums[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    // available days from unfiltered load
    const [availableDays, setAvailableDays] = useState<string[]>([]);

    // filter inputs (what the user is typing/selecting)
    const [filterDay, setFilterDay] = useState('');
    const [filterStartTime, setFilterStartTime] = useState('');
    const [filterEndTime, setFilterEndTime] = useState('');

    // active filters (applied on "Aplicar")
    const [activeFilters, setActiveFilters] = useState<{ start_date?: string; end_date?: string }>({});

    // load all days once on mount (unfiltered)
    useEffect(() => {
        workshopService.getWorkshopSummary().then(res => {
            setAvailableDays(extractDays(res.data ?? []));
        }).catch(() => {});
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await workshopService.getWorkshopSummary(activeFilters);
            setWorkshops(res.data ?? []);
            setError(null);
        } catch (err) {
            console.error('Error al cargar resumen de talleres:', err);
            setError('No se pudo cargar la información de talleres');
        } finally {
            setLoading(false);
        }
    }, [activeFilters]);

    const { connected: mqttConnected } = useMqttWorkshops(fetchData);
    useMqttRegistrations(fetchData);

    useEffect(() => { fetchData(); }, [fetchData]);

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

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            pageRef.current?.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    const handleDayChange = (day: string) => {
        setFilterDay(day);
        if (day) {
            // default to full day when selecting a day
            setFilterStartTime('00:00');
            setFilterEndTime('23:59');
        } else {
            setFilterStartTime('');
            setFilterEndTime('');
        }
    };

    const applyFilters = () => {
        if (!filterDay) { setActiveFilters({}); return; }
        const start = filterStartTime ? `${filterDay}T${filterStartTime}:00` : filterDay;
        const end   = filterEndTime   ? `${filterDay}T${filterEndTime}:00`   : filterDay;
        setActiveFilters({ start_date: start, end_date: end });
    };

    const clearFilters = () => {
        setFilterDay('');
        setFilterStartTime('');
        setFilterEndTime('');
        setActiveFilters({});
    };

    const hasActiveFilters = Object.keys(activeFilters).length > 0;

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
        <DashboardLayout title="Disponibilidad de Talleres" fullBleed>
        <div className="tal-page" ref={pageRef}>
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

            {/* ── Filter bar (hidden in fullscreen) ── */}
            {!isFullscreen && (
                <div className="tal-filter-bar">
                    {/* Día */}
                    <div className="tal-filter-group">
                        <span className="tal-filter-group-label">Día</span>
                        <select
                            className="tal-filter-select tal-filter-select--day"
                            value={filterDay}
                            onChange={e => handleDayChange(e.target.value)}
                        >
                            <option value="">Todos los días</option>
                            {availableDays.map(d => (
                                <option key={d} value={d}>{formatDayShort(d)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Horario desde – hasta */}
                    <div className={`tal-filter-group${!filterDay ? ' tal-filter-group--disabled' : ''}`}>
                        <span className="tal-filter-group-label">Desde</span>
                        <select
                            className="tal-filter-select"
                            value={filterStartTime}
                            onChange={e => setFilterStartTime(e.target.value)}
                            disabled={!filterDay}
                        >
                            <option value="">00:00</option>
                            {HALF_HOURS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <span className="tal-filter-arrow">→</span>

                    <div className={`tal-filter-group${!filterDay ? ' tal-filter-group--disabled' : ''}`}>
                        <span className="tal-filter-group-label">Hasta</span>
                        <select
                            className="tal-filter-select"
                            value={filterEndTime}
                            onChange={e => setFilterEndTime(e.target.value)}
                            disabled={!filterDay}
                        >
                            <option value="">23:59</option>
                            {HALF_HOURS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="tal-filter-actions">
                        <button className="tal-filter-btn tal-filter-btn--apply" onClick={applyFilters}>
                            Aplicar
                        </button>
                        {hasActiveFilters && (
                            <button className="tal-filter-btn tal-filter-btn--clear" onClick={clearFilters}>
                                × Limpiar
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Grid ── */}
            <div className="tal-content">
                {loading ? (
                    <div className="tal-state-msg">Cargando talleres…</div>
                ) : error ? (
                    <div className="tal-state-msg tal-state-msg--error">{error}</div>
                ) : workshops.length === 0 ? (
                    <div className="tal-state-msg">No hay talleres para el filtro seleccionado.</div>
                ) : (
                    <div className="tal-grid">
                        {workshops.map((w, i) => {
                            const capacity  = w.capacity ?? 0;
                            const inscritos = w.total_presences ?? 0;
                            const status    = getAvailStatus(capacity, inscritos);
                            const pct       = capacity > 0 ? Math.min(100, Math.round((inscritos / capacity) * 100)) : 0;
                            const available = Math.max(0, capacity - inscritos);

                            const cardDate  = formatCardDate(w.start_date);
                            const tStart    = fmtTime(w.start_date);
                            const tEnd      = fmtTime(w.end_date);
                            const timeLabel = tStart && tEnd ? `${tStart} – ${tEnd}` : tStart ?? tEnd ?? null;

                            return (
                                <div key={w.id ?? i} className="tal-card">
                                    {/* Tags */}
                                    <div className="tal-card-tags">
                                        <span className={`tal-avail-badge tal-avail-badge--${status}`}>
                                            <span className="tal-avail-dot" />
                                            {status === 'full' ? 'LLENO' : status === 'almost' ? 'CASI LLENO' : 'DISPONIBLE'}
                                        </span>
                                    </div>

                                    {/* Name + date/time/place */}
                                    <div>
                                        <p className="tal-card-name">{w.name ?? 'Taller'}</p>
                                        {cardDate  && <p className="tal-card-date">{cardDate}</p>}
                                        {timeLabel && <p className="tal-card-meta">{timeLabel}</p>}
                                        {w.place && (
                                            <div className="tal-card-place">
                                                <IconPin />
                                                {w.place}
                                            </div>
                                        )}
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
        </DashboardLayout>
    );
}
