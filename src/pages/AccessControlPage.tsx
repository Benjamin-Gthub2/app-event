import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { attendanceService } from '../services/attendanceService';
import { eventService } from '../services/eventService';
import { workshopService } from '../services/workshopService';
import { peopleService } from '../services/peopleService';
import { useMqttAttendances } from '../hooks/useMqttAttendances';
import { SearchableSelect } from '../components/SearchableSelect';
import type { Attendance } from '../types/attendance.types';
import type { Event } from '../types/event.types';
import type { Workshop } from '../types/workshop.types';
import type { Person } from '../types/people.types';
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

const IconGrid = ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);

const IconUserCheck = ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
    </svg>
);

const IconDownload = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const IconAlert = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
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

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

function fmtStartDate(dateStr: string | null): string | undefined {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    return `${DIAS[d.getDay()]} ${d.getDate()}`;
}

function fullName(names: string, surname: string, lastName: string | null) {
    return [names, surname, lastName].filter(Boolean).join(' ');
}

function initials(names: string, surname: string) {
    return `${names[0] ?? ''}${surname[0] ?? ''}`.toUpperCase();
}

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Lima',
    });
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AccessControlPage() {
    // Filter data
    const [events, setEvents] = useState<Event[]>([]);
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [people, setPeople] = useState<Person[]>([]);

    const [eventId, setEventId] = useState('');
    const [workshopId, setWorkshopId] = useState('');
    const [beneficiaryId, setBeneficiaryId] = useState('');
    const [searchValue, setSearchValue] = useState('');

    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingWorkshops, setLoadingWorkshops] = useState(false);
    const [loadingPeople, setLoadingPeople] = useState(true);

    // Results
    const [rows, setRows] = useState<Attendance[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [totalPages, setTotalPages] = useState(1);
    const [queried, setQueried] = useState(false);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load events on mount
    useEffect(() => {
        eventService.getEvents({ size_page: 100 })
            .then((res) => setEvents(res.data ?? []))
            .catch(() => setEvents([]))
            .finally(() => setLoadingEvents(false));
    }, []);

    // Load people on mount
    useEffect(() => {
        peopleService.getPeople({ size_page: 300 })
            .then((res) => setPeople(res.data ?? []))
            .catch(() => setPeople([]))
            .finally(() => setLoadingPeople(false));
    }, []);

    // Load workshops when event changes
    useEffect(() => {
        setWorkshops([]);
        setWorkshopId('');
        if (!eventId) return;
        setLoadingWorkshops(true);
        workshopService.getWorkshops({ event_id: eventId, size_page: 100 })
            .then((res) => setWorkshops(res.data ?? []))
            .catch(() => setWorkshops([]))
            .finally(() => setLoadingWorkshops(false));
    }, [eventId]);

    const handleClear = () => {
        setEventId('');
        setWorkshopId('');
        setBeneficiaryId('');
        setSearchValue('');
        setRows([]);
        setTotalCount(0);
        setPage(1);
        setTotalPages(1);
        setQueried(false);
        setError(null);
    };

    const fetchData = useCallback(async (targetPage: number, targetPageSize: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await attendanceService.getAttendances({
                page: targetPage,
                size_page: targetPageSize,
                event_id: eventId || undefined,
                workshop_id: workshopId || undefined,
                beneficiary_id: beneficiaryId || undefined,
                searchvalue: searchValue.trim() || undefined,
            });
            setRows(res.data ?? []);
            const total = res.pagination?.total ?? (res.data?.length ?? 0);
            setTotalCount(total);
            setTotalPages(Math.max(res.pagination?.last_page ?? 1, 1));
            setQueried(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar las asistencias.');
        } finally {
            setLoading(false);
        }
    }, [eventId, workshopId, beneficiaryId, searchValue]);

    const goToPage = (p: number) => {
        if (p < 1 || p > totalPages || p === page) return;
        setPage(p);
        fetchData(p, pageSize);
    };

    const handleDownloadXlsx = async () => {
        setDownloading(true);
        setError(null);
        try {
            const eventName = eventId ? events.find((ev) => ev.id === eventId)?.name : undefined;
            const workshopName = workshopId ? workshops.find((w) => w.id === workshopId)?.name : undefined;
            const beneficiaryPerson = beneficiaryId ? people.find((p) => p.id === beneficiaryId) : undefined;
            const beneficiaryName = beneficiaryPerson
                ? fullName(beneficiaryPerson.names, beneficiaryPerson.surname, beneficiaryPerson.last_name)
                : undefined;

            await attendanceService.downloadXlsxReport({
                event_id: eventId || undefined,
                workshop_id: workshopId || undefined,
                beneficiary_id: beneficiaryId || undefined,
                searchvalue: searchValue.trim() || undefined,
                event_name: eventName,
                workshop_name: workshopName,
                beneficiary_name: beneficiaryName,
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al generar el reporte.');
        } finally {
            setDownloading(false);
        }
    };

    // Auto-fetch when any SearchableSelect changes (debounced to absorb the workshopId reset on event change)
    const isFirstRender = useRef(true);
    const fetchDataRef = useRef(fetchData);
    fetchDataRef.current = fetchData;

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            setPage(1);
            fetchDataRef.current(1, pageSize);
        }, 150);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, workshopId, beneficiaryId]);

    const { connected: mqttConnected } = useMqttAttendances(() => {
        if (queried) fetchData(page, pageSize);
    });

    // Select options
    const eventOptions = [
        { value: '', label: 'Todos los eventos' },
        ...events.map((ev) => ({ value: ev.id, label: ev.name })),
    ];

    const workshopOptions = [
        { value: '', label: 'Todos los talleres' },
        ...workshops.map((w) => {
            const parts = [w.code, fmtStartDate(w.start_date)].filter(Boolean);
            return {
                value: w.id,
                label: w.name,
                sublabel: parts.length ? parts.join(' · ') : undefined,
            };
        }),
    ];

    const beneficiaryOptions = [
        { value: '', label: 'Todos los beneficiarios' },
        ...people.map((p) => ({
            value: p.id,
            label: fullName(p.names, p.surname, p.last_name),
            sublabel: `${p.document_type.abbreviated_description} ${p.document}`,
        })),
    ];

    // Derived stats
    const uniqueWorkshops = new Set(rows.map((a) => a.workshop.id)).size;
    const uniqueBeneficiaries = new Set(rows.map((a) => a.beneficiary.id)).size;

    return (
        <DashboardLayout title="Control de Asistencia">
            {/* Page header */}
            <div className="ac-header">
                <div className="ac-header-left">
                    <h2>Control de Asistencia</h2>
                    <p>Consulta asistencias por evento, taller o beneficiario</p>
                </div>
                <div className="ac-header-right">
                    <span className="ac-mqtt-status" title={mqttConnected ? 'Tiempo real activo' : 'Sin conexión en tiempo real'}>
                        <span className={`ac-mqtt-dot ${mqttConnected ? 'ac-mqtt-dot--on' : ''}`} />
                        {mqttConnected ? 'En vivo' : 'Sin conexión'}
                    </span>
                    <button
                        className="ac-download-btn"
                        onClick={handleDownloadXlsx}
                        disabled={downloading || !queried}
                        title="Descargar reporte Excel con los filtros actuales"
                    >
                        <IconDownload />
                        {downloading ? 'Descargando...' : 'Descargar XLSX'}
                    </button>
                    <button className="ac-refresh-btn" onClick={() => { if (queried) fetchData(page, pageSize); }} disabled={loading || !queried}>
                        <IconRefresh spinning={loading} />
                        Actualizar
                    </button>
                </div>
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
                        <SearchableSelect
                            options={eventOptions}
                            value={eventId}
                            onChange={setEventId}
                            placeholder="Seleccionar evento..."
                            searchPlaceholder="Buscar evento..."
                            loading={loadingEvents}
                            emptyText="Sin eventos disponibles"
                        />
                    </div>

                    <div className="ac-filter-field">
                        <label className="ac-filter-label">Taller</label>
                        <SearchableSelect
                            options={workshopOptions}
                            value={workshopId}
                            onChange={setWorkshopId}
                            placeholder="Seleccionar taller..."
                            searchPlaceholder="Buscar taller..."
                            loading={loadingWorkshops}
                            disabled={!eventId && workshops.length === 0}
                            emptyText={eventId ? 'Sin talleres para este evento' : 'Selecciona un evento primero'}
                        />
                    </div>

                    <div className="ac-filter-field">
                        <label className="ac-filter-label">Beneficiario</label>
                        <SearchableSelect
                            options={beneficiaryOptions}
                            value={beneficiaryId}
                            onChange={setBeneficiaryId}
                            placeholder="Seleccionar beneficiario..."
                            searchPlaceholder="Buscar por nombre o documento..."
                            loading={loadingPeople}
                            emptyText="Sin beneficiarios disponibles"
                        />
                    </div>

                    <div className="ac-filter-field">
                        <label className="ac-filter-label">Buscar texto</label>
                        <div className="ac-search-wrap">
                            <span className="ac-search-icon"><IconSearch /></span>
                            <input
                                className="ac-search-input"
                                type="text"
                                placeholder="Nombre, apellido, documento..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="ac-filter-actions">
                    <button className="ac-clear-btn" onClick={handleClear}>
                        × Limpiar
                    </button>
                    <button className="ac-consult-btn" onClick={() => { setPage(1); fetchData(1, pageSize); }} disabled={loading}>
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
                        <div className="ac-stat-count">{queried ? totalCount : '—'}</div>
                        <p className="ac-stat-label">Total Asistencias</p>
                        <p className="ac-stat-desc">Registros encontrados</p>
                    </div>
                </div>

                <div className="ac-stat-card ac-stat-card--green">
                    <div className="ac-stat-icon ac-stat-icon--green">
                        <IconGrid size={24} />
                    </div>
                    <div className="ac-stat-body">
                        <div className="ac-stat-count">{queried ? uniqueWorkshops : '—'}</div>
                        <p className="ac-stat-label">Talleres</p>
                        <p className="ac-stat-desc">Talleres con asistencias</p>
                    </div>
                </div>

                <div className="ac-stat-card ac-stat-card--orange">
                    <div className="ac-stat-icon ac-stat-icon--orange">
                        <IconUserCheck size={24} />
                    </div>
                    <div className="ac-stat-body">
                        <div className="ac-stat-count">{queried ? uniqueBeneficiaries : '—'}</div>
                        <p className="ac-stat-label">Beneficiarios</p>
                        <p className="ac-stat-desc">Personas con asistencia</p>
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
                    <p className="ac-card-title">Lista de Asistencias</p>
                    {queried && (
                        <span className="ac-card-count">{totalCount} registro{totalCount !== 1 ? 's' : ''}</span>
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
                                <th>Evento</th>
                                <th>Fecha Asistencia</th>
                                <th>Registrado por</th>
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
                                        <p className="ac-state-desc">Selecciona un evento, taller o beneficiario para iniciar la búsqueda.</p>
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr className="ac-state-row">
                                    <td colSpan={7}>
                                        <div className="ac-state-icon"><IconEmptyUsers /></div>
                                        <p className="ac-state-title">Sin resultados</p>
                                        <p className="ac-state-desc">No se encontraron asistencias para los filtros seleccionados.</p>
                                    </td>
                                </tr>
                            ) : (
                                rows.map((att, idx) => {
                                    const b = att.beneficiary;
                                    const w = att.workshop;
                                    const name = fullName(b.names, b.surname, b.last_name);
                                    return (
                                        <tr key={att.id}>
                                            <td>
                                                <span className="ac-num">{(page - 1) * pageSize + idx + 1}</span>
                                            </td>
                                            <td>
                                                <div className="ac-beneficiary">
                                                    <div className="ac-avatar">{initials(b.names, b.surname)}</div>
                                                    <div className="ac-beneficiary-name">{name}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="ac-badge">
                                                    {b.type_document.abbreviated_description} {b.document}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="ac-workshop-badge">{w.name}</span>
                                            </td>
                                            <td>
                                                <span className="ac-event-badge">{w.event.name}</span>
                                            </td>
                                            <td>
                                                <span className="ac-date">{formatDate(att.created_at)}</span>
                                            </td>
                                            <td>
                                                <span className="ac-created-by">@{att.created_by.username}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {queried && totalCount > 0 && (
                    <div className="ac-pagination">
                        <div className="ac-pagination-size">
                            <span>Filas:</span>
                            <select
                                className="ac-page-size-select"
                                value={pageSize}
                                onChange={(e) => {
                                    const n = Number(e.target.value);
                                    setPageSize(n);
                                    setPage(1);
                                    fetchData(1, n);
                                }}
                            >
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={500}>500</option>
                            </select>
                        </div>
                        <span className="ac-pagination-info">
                            Página {page} de {totalPages} · {totalCount} total
                        </span>
                        <div className="ac-pagination-btns">
                            <button
                                className="ac-page-btn"
                                onClick={() => goToPage(page - 1)}
                                disabled={page <= 1}
                            >‹</button>
                            <span className="ac-page-btn ac-page-btn--active">{page}</span>
                            <button
                                className="ac-page-btn"
                                onClick={() => goToPage(page + 1)}
                                disabled={page >= totalPages}
                            >›</button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
