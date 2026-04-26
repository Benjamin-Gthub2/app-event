import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { registrationService } from '../services/registrationService';
import { eventService } from '../services/eventService';
import { workshopService } from '../services/workshopService';
import { sessionService } from '../services/sessionService';
import type { Registration } from '../types/registration.types';
import type { Event } from '../types/event.types';
import type { Workshop } from '../types/workshop.types';
import type { Session } from '../types/session.types';
import './AccessControlPage.css';

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconFilter = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

const IconRefresh = ({ spinning }: { spinning: boolean }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        className={spinning ? 'ac-spin' : ''}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);

const IconSearch = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const IconUsers = ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconCheckCircle = ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const IconUserCheck = ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
    </svg>
);

const IconAlert = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const IconChevron = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const IconEmptyUsers = () => (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────

function fullName(names: string, surname: string, lastName: string | null) {
    return [names, surname, lastName].filter(Boolean).join(' ');
}

function initials(names: string, surname: string) {
    return `${names[0] ?? ''}${surname[0] ?? ''}`.toUpperCase();
}

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AccessControlPage() {
    // Filters
    const [events, setEvents] = useState<Event[]>([]);
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);

    const [eventId, setEventId] = useState('');
    const [workshopId, setWorkshopId] = useState('');
    const [sessionId, setSessionId] = useState('');

    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingWorkshops, setLoadingWorkshops] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);

    // Results
    const [rows, setRows] = useState<Registration[]>([]);
    const [queried, setQueried] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load events on mount
    useEffect(() => {
        eventService.getEvents({ size_page: 100 })
            .then((res) => setEvents(res.data ?? []))
            .catch(() => setEvents([]))
            .finally(() => setLoadingEvents(false));
    }, []);

    // Load workshops when event changes
    useEffect(() => {
        setWorkshops([]);
        setWorkshopId('');
        setSessions([]);
        setSessionId('');
        if (!eventId) return;
        setLoadingWorkshops(true);
        workshopService.getWorkshops({ event_id: eventId, size_page: 100 })
            .then((res) => setWorkshops(res.data ?? []))
            .catch(() => setWorkshops([]))
            .finally(() => setLoadingWorkshops(false));
    }, [eventId]);

    // Load sessions when workshop changes
    useEffect(() => {
        setSessions([]);
        setSessionId('');
        if (!workshopId) return;
        setLoadingSessions(true);
        sessionService.getSessions({ workshop_id: workshopId, size_page: 100 })
            .then((res) => setSessions(res.data ?? []))
            .catch(() => setSessions([]))
            .finally(() => setLoadingSessions(false));
    }, [workshopId]);

    const handleClear = () => {
        setEventId('');
        setWorkshopId('');
        setSessionId('');
        setRows([]);
        setQueried(false);
        setError(null);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await registrationService.getRegistrations({ size_page: 500 });
            let data = res.data ?? [];
            if (workshopId) {
                data = data.filter((r) => r.session.work_shop.id === workshopId);
            }
            if (sessionId) {
                data = data.filter((r) => r.session.id === sessionId);
            }
            setRows(data);
            setQueried(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar los registros.');
        } finally {
            setLoading(false);
        }
    }, [workshopId, sessionId]);

    const handleConsult = () => { fetchData(); };

    const handleRefresh = () => {
        if (queried) fetchData();
    };

    return (
        <DashboardLayout title="Control de Acceso">
            {/* Page header */}
            <div className="ac-header">
                <div className="ac-header-left">
                    <h2>Control de Acceso</h2>
                    <p>Consulta inscritos, pagados y asistentes por evento, taller o sesión</p>
                </div>
                <button className="ac-refresh-btn" onClick={handleRefresh} disabled={loading || !queried}>
                    <IconRefresh spinning={loading} />
                    Actualizar
                </button>
            </div>

            {/* Filter card */}
            <div className="ac-filter-card">
                <p className="ac-filter-title">
                    <IconFilter />
                    Filtrar por
                </p>
                <div className="ac-filter-grid">
                    <div className="ac-filter-field">
                        <label className="ac-filter-label">Evento</label>
                        <div className="ac-select-wrap">
                            <select
                                className="ac-select"
                                value={eventId}
                                onChange={(e) => setEventId(e.target.value)}
                                disabled={loadingEvents}
                            >
                                <option value="">
                                    {loadingEvents ? 'Cargando eventos...' : 'Todos los eventos...'}
                                </option>
                                {events.map((ev) => (
                                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                                ))}
                            </select>
                            <span className="ac-select-arrow"><IconChevron /></span>
                        </div>
                    </div>

                    <div className="ac-filter-field">
                        <label className="ac-filter-label">Taller</label>
                        <div className="ac-select-wrap">
                            <select
                                className="ac-select"
                                value={workshopId}
                                onChange={(e) => setWorkshopId(e.target.value)}
                                disabled={loadingWorkshops || (!eventId && workshops.length === 0)}
                            >
                                <option value="">
                                    {loadingWorkshops ? 'Cargando...' : 'Todos los talleres...'}
                                </option>
                                {workshops.map((w) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                            <span className="ac-select-arrow"><IconChevron /></span>
                        </div>
                    </div>

                    <div className="ac-filter-field">
                        <label className="ac-filter-label">Sesión</label>
                        <div className="ac-select-wrap">
                            <select
                                className="ac-select"
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value)}
                                disabled={loadingSessions || (!workshopId && sessions.length === 0)}
                            >
                                <option value="">
                                    {loadingSessions ? 'Cargando...' : 'Todas las sesiones...'}
                                </option>
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {formatDate(s.start_date)}{s.end_date ? ` → ${formatDate(s.end_date)}` : ''}
                                    </option>
                                ))}
                            </select>
                            <span className="ac-select-arrow"><IconChevron /></span>
                        </div>
                    </div>
                </div>

                <div className="ac-filter-actions">
                    <button className="ac-clear-btn" onClick={handleClear}>
                        × Limpiar
                    </button>
                    <button className="ac-consult-btn" onClick={handleConsult} disabled={loading}>
                        <IconSearch />
                        Consultar
                    </button>
                </div>
            </div>

            {/* Stats cards */}
            <div className="ac-stats">
                <div className="ac-stat-card ac-stat-card--teal">
                    <div className="ac-stat-icon ac-stat-icon--teal">
                        <IconUsers size={24} />
                    </div>
                    <div className="ac-stat-body">
                        <div className="ac-stat-count">{queried ? rows.length : '—'}</div>
                        <p className="ac-stat-label">Inscritos</p>
                        <p className="ac-stat-desc">Total de inscripciones registradas</p>
                    </div>
                </div>

                <div className="ac-stat-card ac-stat-card--green">
                    <div className="ac-stat-icon ac-stat-icon--green">
                        <IconCheckCircle size={24} />
                    </div>
                    <div className="ac-stat-body">
                        <div className="ac-stat-count">0</div>
                        <p className="ac-stat-label">Pagados</p>
                        <p className="ac-stat-desc">Disponible próximamente</p>
                    </div>
                </div>

                <div className="ac-stat-card ac-stat-card--orange">
                    <div className="ac-stat-icon ac-stat-icon--orange">
                        <IconUserCheck size={24} />
                    </div>
                    <div className="ac-stat-body">
                        <div className="ac-stat-count">0</div>
                        <p className="ac-stat-label">Asistentes</p>
                        <p className="ac-stat-desc">Disponible próximamente</p>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="ac-error">
                    <IconAlert />
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="ac-card">
                <div className="ac-card-head">
                    <p className="ac-card-title">Lista de Participantes</p>
                    {queried && (
                        <span className="ac-card-count">{rows.length} registro{rows.length !== 1 ? 's' : ''}</span>
                    )}
                </div>

                <div className="ac-table-wrap">
                    <table className="ac-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Beneficiario</th>
                                <th>Documento</th>
                                <th>Taller</th>
                                <th>Sesión</th>
                                <th>Inscrito el</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j}>
                                                <span className="ac-skeleton" style={{ width: `${50 + (j * 17) % 80}px` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : !queried ? (
                                <tr className="ac-state-row">
                                    <td colSpan={7}>
                                        <div className="ac-state-icon"><IconEmptyUsers /></div>
                                        <p className="ac-state-title">Aplica un filtro para consultar</p>
                                        <p className="ac-state-desc">Selecciona un evento, taller o sesión y presiona "Consultar".</p>
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr className="ac-state-row">
                                    <td colSpan={7}>
                                        <div className="ac-state-icon"><IconEmptyUsers /></div>
                                        <p className="ac-state-title">Sin resultados</p>
                                        <p className="ac-state-desc">No se encontraron inscripciones para los filtros seleccionados.</p>
                                    </td>
                                </tr>
                            ) : (
                                rows.map((reg, idx) => {
                                    const b = reg.beneficiary;
                                    const name = fullName(b.names, b.surname, b.last_name);
                                    return (
                                        <tr key={reg.id}>
                                            <td>
                                                <span className="ac-num">{idx + 1}</span>
                                            </td>
                                            <td>
                                                <div className="ac-beneficiary">
                                                    <div className="ac-avatar">{initials(b.names, b.surname)}</div>
                                                    <div>
                                                        <div className="ac-beneficiary-name">{name}</div>
                                                        <div className="ac-beneficiary-user">@{b.user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="ac-badge">
                                                    {b.type_document.abbreviated_description} {b.document}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="ac-workshop-badge">
                                                    {reg.session.work_shop.name}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="ac-date">{formatDate(reg.session.start_date)}</div>
                                                <div className="ac-date" style={{ fontSize: 11 }}>{formatDate(reg.session.end_date)}</div>
                                            </td>
                                            <td>
                                                <span className="ac-date">{formatDate(reg.created_at)}</span>
                                            </td>
                                            <td>
                                                <span className="ac-status-badge">
                                                    <span className="ac-status-dot" />
                                                    Inscrito
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
