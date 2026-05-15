import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import QrScanner from '../components/QrScanner';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { SearchableSelect } from '../components/SearchableSelect';
import { registrationService } from '../services/registrationService';
import { useMqttRegistrations } from '../hooks/useMqttRegistrations';
import { attendanceService } from '../services/attendanceService';
import { ApiError } from '../services/apiClient';
import { eventService } from '../services/eventService';
import { workshopService } from '../services/workshopService';
import type { Registration, RegistrationByEvent } from '../types/registration.types';
import type { Event } from '../types/event.types';
import type { Workshop } from '../types/workshop.types';
import type { SelectOption } from '../components/SearchableSelect';
import './QrScannerPage.css';

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

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Lima',
    });
}

// ── Types ──────────────────────────────────────────────────────────────────────

type ScanMode = 'scan' | 'list';

type ScanState =
    | { status: 'idle' }
    | { status: 'loading'; id: string }
    | { status: 'found'; registration: Registration; fromMode: ScanMode }
    | { status: 'notfound'; id: string }
    | { status: 'error'; message: string };

type AttendanceState =
    | { status: 'idle' }
    | { status: 'saving' }
    | { status: 'saved' }
    | { status: 'error'; message: string };

// ── AttendanceModal ────────────────────────────────────────────────────────────

interface AttendanceModalProps {
    type: 'success' | 'error' | 'warning';
    title?: string;
    message: string;
    onClose: () => void;
}

const MODAL_DEFAULTS: Record<AttendanceModalProps['type'], { title: string; icon: string }> = {
    success: { title: 'Asistencia guardada', icon: '✓' },
    error:   { title: 'Error al guardar',    icon: '✕' },
    warning: { title: 'Atención',            icon: '⚠' },
};

const AttendanceModal: React.FC<AttendanceModalProps> = ({ type, title, message, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 6000);
        return () => clearTimeout(t);
    }, [onClose]);

    const defaults = MODAL_DEFAULTS[type];

    return createPortal(
        <div className="qr-modal-overlay" onClick={onClose}>
            <div className={`qr-modal-card qr-modal-card--${type}`} onClick={e => e.stopPropagation()}>
                <div className={`qr-modal-icon qr-modal-icon--${type}`}>
                    {defaults.icon}
                </div>
                <h2 className="qr-modal-title">
                    {title ?? defaults.title}
                </h2>
                <p className="qr-modal-message">{message}</p>
                <p className="qr-modal-hint">Toca en cualquier lugar para cerrar</p>
            </div>
        </div>,
        document.body,
    );
};

// ── AttendanceButton sub-component ─────────────────────────────────────────────

interface AttendanceButtonProps {
    workshopId: string;
    beneficiaryId: string;
}

const AttendanceButton: React.FC<AttendanceButtonProps> = ({ workshopId, beneficiaryId }) => {
    const [state, setState] = useState<AttendanceState>({ status: 'idle' });
    const [modal, setModal] = useState<{ type: 'success' | 'error' | 'warning'; title?: string; message: string } | null>(null);

    const closeModal = useCallback(() => setModal(null), []);

    const handleSave = async () => {
        setState({ status: 'saving' });
        try {
            await attendanceService.createAttendance({ workshop_id: workshopId, beneficiary_id: beneficiaryId });
            setState({ status: 'saved' });
            setModal({ type: 'success', message: 'La asistencia del participante fue registrada correctamente.' });
        } catch (e) {
            if (e instanceof ApiError) {
                if (e.code === 'ERR_ATTENDANCE_ALREADY_EXISTS') {
                    const msg = 'El beneficiario ya tiene asistencia registrada en este taller.';
                    setState({ status: 'error', message: msg });
                    setModal({ type: 'warning', title: 'Ya registrado', message: msg });
                    return;
                }
                if (e.code === 'ERR_ATTENDANCE_SCHEDULE_CONFLICT') {
                    const msg = 'El beneficiario ya está inscrito en otro taller que inicia a la misma hora.';
                    setState({ status: 'error', message: msg });
                    setModal({ type: 'warning', title: 'Conflicto de horario', message: msg });
                    return;
                }
            }
            const msg = e instanceof Error ? e.message : 'Error al guardar asistencia';
            setState({ status: 'error', message: msg });
            setModal({ type: 'error', message: msg });
        }
    };

    return (
        <>
            {modal && <AttendanceModal type={modal.type} title={modal.title} message={modal.message} onClose={closeModal} />}
            <div className="qr-attendance-wrap">
                {state.status === 'saved' ? (
                    <div className="qr-attendance-saved">✓ Asistencia guardada correctamente</div>
                ) : (
                    <>
                        {state.status === 'error' && (
                            <p className="qr-status-error">{state.message}</p>
                        )}
                        <button
                            className="qr-btn-attendance"
                            onClick={handleSave}
                            disabled={state.status === 'saving'}
                        >
                            {state.status === 'saving'
                                ? <><span className="qr-spinner qr-spinner--sm" /> Guardando...</>
                                : '✓ Guardar asistencia'
                            }
                        </button>
                    </>
                )}
            </div>
        </>
    );
};

// ── Component ──────────────────────────────────────────────────────────────────

const QrScannerPage: React.FC = () => {
    const [scanKey, setScanKey] = useState(0);
    const [state, setState] = useState<ScanState>({ status: 'idle' });
    const [mode, setMode] = useState<ScanMode>('scan');

    // Event / workshop selectors
    const [events, setEvents] = useState<Event[]>([]);
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [selectedWorkshopId, setSelectedWorkshopId] = useState('');
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [workshopsLoaded, setWorkshopsLoaded] = useState(false);
    const loadingWorkshops = !!selectedEventId && !workshopsLoaded;

    // Registrations list for list mode
    const [registrationsList, setRegistrationsList] = useState<RegistrationByEvent[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [selectedListId, setSelectedListId] = useState('');

    useEffect(() => {
        eventService.getEvents({ size_page: 100 })
            .then(res => setEvents(res.data ?? []))
            .catch(() => setEvents([]))
            .finally(() => setLoadingEvents(false));
    }, []);

    useEffect(() => {
        if (!selectedEventId) return;
        workshopService.getWorkshops({ event_id: selectedEventId, size_page: 100, only_today: true })
            .then(res => setWorkshops(res.data ?? []))
            .catch(() => setWorkshops([]))
            .finally(() => setWorkshopsLoaded(true));
    }, [selectedEventId]);

    const fetchRegistrationsList = useCallback(() => {
        if (!selectedEventId) {
            setRegistrationsList([]);
            return;
        }
        setLoadingList(true);
        registrationService.getRegistrationsByEvent(selectedEventId)
            .then(res => setRegistrationsList(res.data ?? []))
            .catch(() => setRegistrationsList([]))
            .finally(() => setLoadingList(false));
    }, [selectedEventId]);

    useEffect(() => {
        fetchRegistrationsList();
    }, [fetchRegistrationsList]);

    useMqttRegistrations(fetchRegistrationsList);

    const handleEventChange = (eventId: string) => {
        setSelectedEventId(eventId);
        setSelectedWorkshopId('');
        setWorkshops([]);
        setWorkshopsLoaded(false);
        setSelectedListId('');
        setRegistrationsList([]);
    };

    const eventOptions: SelectOption[] = events.map(e => ({
        value: e.id,
        label: e.name,
        sublabel: e.code ?? undefined,
    }));

    const workshopOptions: SelectOption[] = workshops.map(w => {
        const parts = [w.code, fmtStartDate(w.start_date)].filter(Boolean);
        return {
            value: w.id,
            label: w.name,
            sublabel: parts.length ? parts.join(' · ') : undefined,
        };
    });

    const registrationListOptions: SelectOption[] = registrationsList.map(r => ({
        value: r.id,
        label: fullName(r.beneficiary.names, r.beneficiary.surname, r.beneficiary.last_name),
        sublabel: `${r.beneficiary.type_document.abbreviated_description} · ${r.beneficiary.document}`,
    }));

    const canScan = !!selectedEventId && !!selectedWorkshopId;

    const handleScan = async (id: string, fromMode: ScanMode = 'scan') => {
        setState({ status: 'loading', id });
        try {
            const registration = await registrationService.getRegistrationById(id);
            if (fromMode === 'scan' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
            setState({ status: 'found', registration, fromMode });
        } catch (e) {
            const msg = e instanceof Error ? e.message : '';
            if (msg.includes('404') || msg.includes('400')) {
                if (fromMode === 'scan' && navigator.vibrate) navigator.vibrate([300]);
                setState({ status: 'notfound', id });
            } else {
                setState({ status: 'error', message: msg || 'Error al consultar el registro.' });
            }
        }
    };

    const handleReset = () => {
        setState({ status: 'idle' });
        setScanKey(k => k + 1);
        setSelectedListId('');
    };

    // ── Loading ──────────────────────────────────────────────────────────────

    if (state.status === 'loading') {
        return (
            <DashboardLayout title="Escáner QR">
                <div className="qr-page qr-page--embedded">
                    <div className="qr-result-card">
                        <div className="qr-result-icon qr-result-icon--loading">
                            <span className="qr-spinner" />
                        </div>
                        <h2 className="qr-result-title">Verificando...</h2>
                        <p className="qr-result-subtitle">Consultando inscripción</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ── Found ────────────────────────────────────────────────────────────────

    if (state.status === 'found') {
        const { registration: r, fromMode } = state;
        const b = r.beneficiary;
        const selectedWorkshop = workshops.find(w => w.id === selectedWorkshopId);

        return (
            <DashboardLayout title="Escáner QR">
                <div className="qr-page qr-page--embedded">
                    <div className="qr-result-card qr-result-card--success">
                        <div className="qr-result-icon qr-result-icon--success">✓</div>
                        <h2 className="qr-result-title">Inscripción válida</h2>
                        <p className="qr-result-subtitle" style={{ color: '#22c55e' }}>Asistente verificado correctamente</p>

                        <div className="qr-detail-box">
                            <p className="qr-label">Beneficiario</p>
                            <div className="qr-row">
                                <span className="qr-key">Nombre</span>
                                <span className="qr-val">{fullName(b.names, b.surname, b.last_name)}</span>
                            </div>
                            <div className="qr-row">
                                <span className="qr-key">Documento</span>
                                <span className="qr-val">{b.type_document.abbreviated_description} {b.document}</span>
                            </div>
                        </div>

                        <div className="qr-detail-box">
                            <p className="qr-label">Evento</p>
                            <div className="qr-row">
                                <span className="qr-key">Nombre</span>
                                <span className="qr-val">{r.event.name}</span>
                            </div>
                            {r.event.description && (
                                <div className="qr-row">
                                    <span className="qr-key">Descripción</span>
                                    <span className="qr-val">{r.event.description}</span>
                                </div>
                            )}
                        </div>

                        <div className="qr-detail-box">
                            <p className="qr-label">Taller seleccionado</p>
                            <div className="qr-row">
                                <span className="qr-key">Taller</span>
                                <span className="qr-val">{selectedWorkshop?.name ?? '—'}</span>
                            </div>
                        </div>

                        <div className="qr-detail-box">
                            <p className="qr-label">Estado actual</p>
                            <div className="qr-row">
                                <span className="qr-key">Estado</span>
                                <span className="qr-status-badge">{r.status.description}</span>
                            </div>
                        </div>

                        {selectedWorkshopId && (
                            <AttendanceButton
                                workshopId={selectedWorkshopId}
                                beneficiaryId={b.id}
                            />
                        )}

                        <div className="qr-detail-box">
                            <p className="qr-label">Registrado por</p>
                            <div className="qr-row">
                                <span className="qr-key">Nombre</span>
                                <span className="qr-val">
                                    {fullName(r.created_by.names, r.created_by.surname, r.created_by.last_name)}
                                </span>
                            </div>
                            <div className="qr-row">
                                <span className="qr-key">Fecha</span>
                                <span className="qr-val">{formatDate(r.created_at)}</span>
                            </div>
                        </div>

                        <button onClick={handleReset} className="qr-btn-back qr-btn-back--success">
                            {fromMode === 'scan' ? '← Escanear otro código' : '← Buscar otro registrado'}
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ── Not found ────────────────────────────────────────────────────────────

    if (state.status === 'notfound') {
        return (
            <DashboardLayout title="Escáner QR">
                <div className="qr-page qr-page--embedded">
                    <div className="qr-result-card qr-result-card--error">
                        <div className="qr-result-icon qr-result-icon--error">✕</div>
                        <h2 className="qr-result-title">No encontrado</h2>
                        <p className="qr-result-subtitle" style={{ color: '#ef4444' }}>
                            El código escaneado no corresponde a ninguna inscripción registrada
                        </p>
                        <div className="qr-detail-box">
                            <p className="qr-label">ID escaneado</p>
                            <p className="qr-raw-text" style={{ color: '#ef4444', wordBreak: 'break-all' }}>
                                {state.id}
                            </p>
                        </div>
                        <button onClick={handleReset} className="qr-btn-back qr-btn-back--error">
                            ← Intentar de nuevo
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ── Generic error ────────────────────────────────────────────────────────

    if (state.status === 'error') {
        return (
            <DashboardLayout title="Escáner QR">
                <div className="qr-page qr-page--embedded">
                    <div className="qr-result-card qr-result-card--error">
                        <div className="qr-result-icon qr-result-icon--error">!</div>
                        <h2 className="qr-result-title">Error de conexión</h2>
                        <p className="qr-result-subtitle" style={{ color: '#ef4444' }}>{state.message}</p>
                        <button onClick={handleReset} className="qr-btn-back qr-btn-back--error">
                            ← Intentar de nuevo
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ── Idle ─────────────────────────────────────────────────────────────────

    return (
        <DashboardLayout title="Escáner QR">
            <div className="qr-page qr-page--embedded">
                <div className="qr-scanner-card">

                    {/* Header */}
                    <div className="qr-scanner-header">
                        <div className="qr-scanner-icon-wrapper">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                                <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="qr-scanner-title">Registro de Asistencias</h1>
                            <p className="qr-scanner-subtitle">
                                {mode === 'scan'
                                    ? 'Selecciona el evento y taller antes de escanear'
                                    : 'Selecciona el evento para buscar en la lista'}
                            </p>
                        </div>
                    </div>

                    {/* Mode toggle */}
                    <div className="qr-mode-toggle">
                        <button
                            className={`qr-mode-btn${mode === 'scan' ? ' qr-mode-btn--active' : ''}`}
                            onClick={() => setMode('scan')}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" />
                            </svg>
                            Escáner QR
                        </button>
                        <button
                            className={`qr-mode-btn${mode === 'list' ? ' qr-mode-btn--active' : ''}`}
                            onClick={() => setMode('list')}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="3" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="3" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="3" cy="18" r="1.2" fill="currentColor" stroke="none" />
                            </svg>
                            Buscar en lista
                        </button>
                    </div>

                    {/* Shared selectors */}
                    <div className="qr-selectors">
                        <div className="qr-selector-field">
                            <label className="qr-selector-label">Evento</label>
                            <SearchableSelect
                                options={eventOptions}
                                value={selectedEventId}
                                onChange={handleEventChange}
                                placeholder="Seleccionar evento..."
                                searchPlaceholder="Buscar evento..."
                                loading={loadingEvents}
                                emptyText="Sin eventos disponibles"
                            />
                        </div>
                        <div className="qr-selector-field">
                            <label className="qr-selector-label">Taller</label>
                            <SearchableSelect
                                options={workshopOptions}
                                value={selectedWorkshopId}
                                onChange={v => setSelectedWorkshopId(v)}
                                placeholder={selectedEventId ? 'Seleccionar taller...' : 'Primero selecciona un evento'}
                                searchPlaceholder="Buscar taller..."
                                loading={loadingWorkshops}
                                disabled={!selectedEventId}
                                emptyText="Sin talleres para este evento"
                            />
                        </div>
                    </div>

                    {/* Mode-specific content */}
                    {mode === 'scan' ? (
                        canScan ? (
                            <>
                                <div className="qr-scanner-viewport">
                                    <QrScanner onScan={handleScan} scanKey={scanKey} />
                                    <div className="qr-corner qr-corner--tl" />
                                    <div className="qr-corner qr-corner--tr" />
                                    <div className="qr-corner qr-corner--bl" />
                                    <div className="qr-corner qr-corner--br" />
                                </div>
                                <p className="qr-scanner-hint">
                                    El escaneo es automático al detectar el código
                                </p>
                            </>
                        ) : (
                            <div className="qr-scanner-blocked">
                                <p>Selecciona un evento y un taller para activar el escáner</p>
                            </div>
                        )
                    ) : (
                        !selectedEventId ? (
                            <div className="qr-scanner-blocked">
                                <p>Selecciona un evento para ver la lista de inscritos</p>
                            </div>
                        ) : (
                            <div className="qr-selector-field">
                                <label className="qr-selector-label">Inscrito</label>
                                <SearchableSelect
                                    options={registrationListOptions}
                                    value={selectedListId}
                                    onChange={id => { setSelectedListId(id); if (id) void handleScan(id, 'list'); }}
                                    placeholder="Buscar por nombre o documento..."
                                    searchPlaceholder="Nombre o documento..."
                                    loading={loadingList}
                                    emptyText="Sin inscritos para este evento"
                                />
                            </div>
                        )
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
};

export default QrScannerPage;
