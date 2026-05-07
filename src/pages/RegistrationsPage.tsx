import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { registrationService } from '../services/registrationService';
import { registrationStatusService } from '../services/registrationStatusService';
import { workshopService } from '../services/workshopService';
import { sessionService } from '../services/sessionService';
import { peopleService } from '../services/peopleService';
import type { CreatePersonBody } from '../services/peopleService';
import { SearchableSelect } from '../components/SearchableSelect';
import type { Registration, Pagination, Status } from '../types/registration.types';
import type { RegistrationStatus } from '../types/registrationStatus.types';
import type { Workshop } from '../types/workshop.types';
import type { Session } from '../types/session.types';
import type { Person } from '../types/people.types';
import type { SelectOption } from '../components/SearchableSelect';
import { useMqttRegistrations } from '../hooks/useMqttRegistrations';
import './RegistrationsPage.css';

// ── Document types catalog (no dedicated endpoint exists) ──────────────────────
const DOCUMENT_TYPES = [
    { id: '00a58296-93b4-11ee-a040-0242ac11000e', label: 'DNI' },
    { id: '00a58572-93b4-11ee-a040-0242ac11000e', label: 'PASAPORTE' },
    { id: '00a584ae-93b4-11ee-a040-0242ac11000e', label: 'CARNÉ EXT.' },
    { id: '00a58522-93b4-11ee-a040-0242ac11000e', label: 'RUC' },
    { id: '00a585c3-93b4-11ee-a040-0242ac11000e', label: 'CARNÉ SOLIC. REFUGIO' },
    { id: '00a58610-93b4-11ee-a040-0242ac11000e', label: 'PART. NAC.' },
    { id: '00a58659-93b4-11ee-a040-0242ac11000e', label: 'C. IDENT.-RREE' },
    { id: '00a586a3-93b4-11ee-a040-0242ac11000e', label: 'PTP' },
    { id: '00a586f0-93b4-11ee-a040-0242ac11000e', label: 'DOC. ID. EXTR.' },
    { id: '00a58739-93b4-11ee-a040-0242ac11000e', label: 'CPP' },
];

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconSearch = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const IconRefresh = ({ spinning }: { spinning: boolean }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        className={spinning ? 'reg-spin' : ''}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);

const IconUsers = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconAlert = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const IconChevronLeft = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const IconChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const IconQr = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" />
        <rect x="3" y="16" width="5" height="5" />
        <path d="M21 16h-3v3" /><path d="M21 21v-1" /><path d="M16 21h1" />
        <path d="M12 3v5" /><path d="M12 12v1" /><path d="M12 16v1" />
        <path d="M3 12h5" /><path d="M12 12h1" /><path d="M16 12h5" />
    </svg>
);

const IconClose = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconPlus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
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
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

const PAGE_SIZE = 10;

function formatDateShort(iso: string | null) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// ── Status cell ────────────────────────────────────────────────────────────────

interface StatusCellProps {
    registration: Registration;
    allStatuses: RegistrationStatus[];
    onUpdated: (registrationId: string, newStatus: Status) => void;
}

function StatusCell({ registration, allStatuses, onUpdated }: StatusCellProps) {
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nextStatus = allStatuses
        .filter(s => s.enable && s.position > registration.status.position)
        .sort((a, b) => a.position - b.position)[0] ?? null;

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        if (code === registration.status.code || updating) return;
        setUpdating(true);
        setError(null);
        try {
            await registrationService.updateRegistrationStatus(registration.id, code);
            const matched = allStatuses.find(s => s.code === code)!;
            onUpdated(registration.id, {
                id: matched.id,
                code: matched.code,
                description: matched.description,
                position: matched.position,
                enable: matched.enable,
                created_at: matched.created_at,
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error');
        } finally {
            setUpdating(false);
        }
    };

    const isDisabled = updating || !nextStatus;
    const colorKey = registration.status.code.toLowerCase();

    return (
        <div className="reg-status-cell">
            <div className={`reg-status-select-wrap reg-status-select-wrap--${colorKey}${isDisabled ? ' reg-status-select-wrap--disabled' : ''}`}>
                <select
                    className="reg-status-select"
                    value={registration.status.code}
                    onChange={handleChange}
                    disabled={isDisabled}
                >
                    <option value={registration.status.code}>{registration.status.description}</option>
                    {nextStatus && (
                        <option value={nextStatus.code}>{nextStatus.description}</option>
                    )}
                </select>
            </div>
            {updating && <span className="reg-status-spinner" />}
            {error && !updating && <span className="reg-status-error-inline" title={error}>!</span>}
        </div>
    );
}

// ── Status legend ──────────────────────────────────────────────────────────────

function StatusLegend({ statuses }: { statuses: RegistrationStatus[] }) {
    if (statuses.length === 0) return null;

    const sorted = [...statuses]
        .filter(s => s.enable)
        .sort((a, b) => a.position - b.position);

    return (
        <div className="reg-legend">
            <span className="reg-legend-label">Flujo de estados</span>
            <div className="reg-legend-flow">
                {sorted.map((s, i) => (
                    <span key={s.code} className="reg-legend-item">
                        <span className={`reg-legend-pill reg-legend-pill--${s.code.toLowerCase()}`}>
                            <span className="reg-legend-pos">{s.position}</span>
                            {s.description}
                        </span>
                        {i < sorted.length - 1 && (
                            <span className="reg-legend-arrow">→</span>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ── Create Person Modal ────────────────────────────────────────────────────────

interface CreatePersonModalProps {
    initialSearch: string;
    onClose: () => void;
    onCreated: (person: SelectOption) => void;
}

const DNI_TYPE_ID = '00a58296-93b4-11ee-a040-0242ac11000e';
const RUC_TYPE_ID = '00a58522-93b4-11ee-a040-0242ac11000e';

function CreatePersonModal({ initialSearch, onClose, onCreated }: CreatePersonModalProps) {
    const [form, setForm] = useState<CreatePersonBody>({
        names: '',
        surname: '',
        last_name: '',
        type_document_id: DOCUMENT_TYPES[0].id,
        document: initialSearch,
        phone: '',
        email: '',
        gender: '',
        enable: true,
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [fetchingDoc, setFetchingDoc] = useState(false);
    const [docError, setDocError] = useState<string | null>(null);

    const canSearchDoc = form.type_document_id === DNI_TYPE_ID || form.type_document_id === RUC_TYPE_ID;

    const set = (field: keyof CreatePersonBody) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleDocSearch = async () => {
        const token = import.meta.env.VITE_APIPERU_TOKEN as string | undefined;
        if (!token) {
            setDocError('Configura VITE_APIPERU_TOKEN en el archivo .env para usar esta función.');
            return;
        }
        if (!form.document.trim()) {
            setDocError('Ingresa el número de documento primero.');
            return;
        }
        setFetchingDoc(true);
        setDocError(null);
        try {
            const isDni = form.type_document_id === DNI_TYPE_ID;
            const url = isDni
                ? `https://apiperu.dev/api/dni/${form.document.trim()}`
                : `https://apiperu.dev/api/ruc/${form.document.trim()}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message ?? `Error ${res.status}`);
            if (isDni) {
                setForm(prev => ({
                    ...prev,
                    names:     json.data.nombres          ?? prev.names,
                    surname:   json.data.apellido_paterno ?? prev.surname,
                    last_name: json.data.apellido_materno ?? prev.last_name,
                }));
            } else {
                setForm(prev => ({
                    ...prev,
                    names:   json.data.nombre_o_razon_social ?? prev.names,
                    surname: prev.surname || '-',
                }));
            }
        } catch (err) {
            setDocError(err instanceof Error ? err.message : 'No se pudo consultar APIPERU.');
        } finally {
            setFetchingDoc(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);
        try {
            const body: CreatePersonBody = {
                ...form,
                last_name: form.last_name || undefined,
                phone: form.phone || undefined,
                email: form.email || undefined,
                gender: form.gender || undefined,
            };
            const newId = await peopleService.createPerson(body);
            const docType = DOCUMENT_TYPES.find(d => d.id === form.type_document_id);
            onCreated({
                value: newId,
                label: [form.names, form.surname, form.last_name].filter(Boolean).join(' '),
                sublabel: `${docType?.label ?? ''} ${form.document}`.trim(),
            });
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Error al crear la persona.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="reg-modal-overlay">
            <div className="reg-modal reg-form-modal reg-create-person-modal">
                <div className="reg-modal-header">
                    <div>
                        <h3 className="reg-modal-title">Nueva Persona</h3>
                        <p className="reg-modal-sub">Completa los datos para registrar al beneficiario</p>
                    </div>
                    <button className="reg-modal-close" onClick={onClose} type="button" aria-label="Cerrar">
                        <IconClose />
                    </button>
                </div>

                <form className="reg-form-body" onSubmit={handleSubmit}>
                    {formError && (
                        <div className="reg-form-alert">
                            <IconAlert />
                            {formError}
                        </div>
                    )}

                    <div className="reg-form-row">
                        <div className="reg-form-field">
                            <label className="reg-form-label">Tipo de documento <span className="reg-required">*</span></label>
                            <select className="reg-form-input" value={form.type_document_id} onChange={set('type_document_id')} required>
                                {DOCUMENT_TYPES.map(d => (
                                    <option key={d.id} value={d.id}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="reg-form-field">
                            <label className="reg-form-label">N° de documento <span className="reg-required">*</span></label>
                            <div className="reg-doc-input-wrap">
                                <input
                                    className="reg-form-input reg-doc-input"
                                    value={form.document}
                                    onChange={e => { set('document')(e); setDocError(null); }}
                                    required
                                    placeholder="Ej. 12345678"
                                />
                                {canSearchDoc && (
                                    <button
                                        type="button"
                                        className="reg-doc-search-btn"
                                        onClick={handleDocSearch}
                                        disabled={fetchingDoc || !form.document.trim()}
                                        title="Buscar datos en APIPERU"
                                    >
                                        {fetchingDoc
                                            ? <span className="reg-doc-spinner" />
                                            : <IconSearch />}
                                    </button>
                                )}
                            </div>
                            {docError && <p className="reg-doc-error">{docError}</p>}
                        </div>
                    </div>

                    <div className="reg-form-row">
                        <div className="reg-form-field">
                            <label className="reg-form-label">Nombres <span className="reg-required">*</span></label>
                            <input className="reg-form-input" value={form.names} onChange={set('names')} required placeholder="Ej. Juan Carlos" />
                        </div>
                        <div className="reg-form-field">
                            <label className="reg-form-label">Ap. Paterno <span className="reg-required">*</span></label>
                            <input className="reg-form-input" value={form.surname} onChange={set('surname')} required placeholder="Ej. López" />
                        </div>
                    </div>

                    <div className="reg-form-row">
                        <div className="reg-form-field">
                            <label className="reg-form-label">Ap. Materno</label>
                            <input className="reg-form-input" value={form.last_name ?? ''} onChange={set('last_name')} placeholder="Ej. García" />
                        </div>
                        <div className="reg-form-field">
                            <label className="reg-form-label">Género</label>
                            <select className="reg-form-input" value={form.gender ?? ''} onChange={set('gender')}>
                                <option value="">— Sin especificar —</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="O">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className="reg-form-row">
                        <div className="reg-form-field">
                            <label className="reg-form-label">Teléfono</label>
                            <input className="reg-form-input" value={form.phone ?? ''} onChange={set('phone')} placeholder="Ej. 987654321" />
                        </div>
                        <div className="reg-form-field">
                            <label className="reg-form-label">Correo electrónico</label>
                            <input className="reg-form-input" type="email" value={form.email ?? ''} onChange={set('email')} placeholder="Ej. juan@correo.com" />
                        </div>
                    </div>

                    <div className="reg-form-actions">
                        <button type="button" className="reg-form-cancel" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button type="submit" className="reg-form-submit" disabled={saving}>
                            {saving ? 'Guardando...' : 'Crear persona'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Add Registration Modal ─────────────────────────────────────────────────────

interface AddRegistrationModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

function AddRegistrationModal({ onClose, onSuccess }: AddRegistrationModalProps) {
    const [workshopId, setWorkshopId] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [personId, setPersonId] = useState('');

    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [people, setPeople] = useState<Person[]>([]);

    const [loadingWorkshops, setLoadingWorkshops] = useState(true);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loadingPeople, setLoadingPeople] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [createPersonSearch, setCreatePersonSearch] = useState<string | null>(null);

    useEffect(() => {
        workshopService.getWorkshops({ size_page: 100 })
            .then((res) => setWorkshops(res.data ?? []))
            .catch(() => setWorkshops([]))
            .finally(() => setLoadingWorkshops(false));

        peopleService.getPeople({ size_page: 100 })
            .then((res) => setPeople(res.data ?? []))
            .catch(() => setPeople([]))
            .finally(() => setLoadingPeople(false));
    }, []);

    useEffect(() => {
        if (!workshopId) {
            setSessions([]);
            setSessionId('');
            return;
        }
        setLoadingSessions(true);
        setSessionId('');
        sessionService.getSessions({ workshop_id: workshopId, size_page: 100 })
            .then((res) => setSessions(res.data ?? []))
            .catch(() => setSessions([]))
            .finally(() => setLoadingSessions(false));
    }, [workshopId]);

    const workshopOptions: SelectOption[] = workshops.map((w) => ({
        value: w.id,
        label: w.name,
        sublabel: w.code ?? undefined,
    }));

    const sessionOptions: SelectOption[] = sessions.map((s) => {
        const start = formatDateShort(s.start_date);
        const end = formatDateShort(s.end_date);
        return {
            value: s.id,
            label: start || 'Sesión',
            sublabel: end ? `hasta ${end}` : undefined,
        };
    });

    const personOptions: SelectOption[] = people.map((p) => ({
        value: p.id,
        label: [p.names, p.surname, p.last_name].filter(Boolean).join(' '),
        sublabel: `${p.document_type.abbreviated_description} ${p.document}`,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionId || !personId) return;
        setSaving(true);
        setFormError(null);
        try {
            await registrationService.createRegistration({ session_id: sessionId, beneficiary_id: personId });
            onSuccess();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Error al guardar la inscripción.');
        } finally {
            setSaving(false);
        }
    };

    const handlePersonCreated = (newPerson: SelectOption) => {
        setPeople(prev => [...prev, {
            id: newPerson.value,
            document: newPerson.sublabel?.split(' ').pop() ?? '',
            names: newPerson.label.split(' ')[0] ?? '',
            surname: newPerson.label.split(' ')[1] ?? '',
            last_name: null,
            phone: null,
            email: null,
            gender: null,
            enable: true,
            created_at: null,
            document_type: { id: '', description: '', abbreviated_description: newPerson.sublabel?.split(' ')[0] ?? '' },
        } as Person]);
        setPersonId(newPerson.value);
        setCreatePersonSearch(null);
    };

    return (
        <>
            <div className="reg-modal-overlay" onClick={onClose}>
                <div className="reg-modal reg-form-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="reg-modal-header">
                        <div>
                            <h3 className="reg-modal-title">Nueva Inscripción</h3>
                            <p className="reg-modal-sub">Completa los datos para registrar al asistente</p>
                        </div>
                        <button className="reg-modal-close" onClick={onClose} aria-label="Cerrar" type="button">
                            <IconClose />
                        </button>
                    </div>

                    <form className="reg-form-body" onSubmit={handleSubmit}>
                        {formError && (
                            <div className="reg-form-alert">
                                <IconAlert />
                                {formError}
                            </div>
                        )}

                        <div className="reg-form-field">
                            <label className="reg-form-label">
                                Taller <span className="reg-required">*</span>
                            </label>
                            <SearchableSelect
                                options={workshopOptions}
                                value={workshopId}
                                onChange={(v) => setWorkshopId(v)}
                                placeholder="Seleccionar taller..."
                                searchPlaceholder="Buscar taller..."
                                loading={loadingWorkshops}
                                emptyText="Sin talleres disponibles"
                            />
                        </div>

                        <div className="reg-form-field">
                            <label className="reg-form-label">
                                Sesión <span className="reg-required">*</span>
                            </label>
                            <SearchableSelect
                                options={sessionOptions}
                                value={sessionId}
                                onChange={(v) => setSessionId(v)}
                                placeholder={workshopId ? 'Seleccionar sesión...' : 'Primero selecciona un taller'}
                                searchPlaceholder="Buscar sesión..."
                                loading={loadingSessions}
                                disabled={!workshopId}
                                emptyText="Sin sesiones para este taller"
                            />
                        </div>

                        <div className="reg-form-field">
                            <label className="reg-form-label">
                                Beneficiario <span className="reg-required">*</span>
                            </label>
                            <SearchableSelect
                                options={personOptions}
                                value={personId}
                                onChange={(v) => setPersonId(v)}
                                placeholder="Seleccionar beneficiario..."
                                searchPlaceholder="Buscar por nombre o documento..."
                                loading={loadingPeople}
                                emptyText="No se encontró ninguna persona"
                                emptyAction={{
                                    label: (s) => `¿No está en la lista? Crear "${s}"`,
                                    onClick: (s) => setCreatePersonSearch(s),
                                }}
                            />
                        </div>

                        <div className="reg-form-actions">
                            <button
                                type="button"
                                className="reg-form-cancel"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="reg-form-submit"
                                disabled={!sessionId || !personId || saving}
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {createPersonSearch !== null && (
                <CreatePersonModal
                    initialSearch={createPersonSearch}
                    onClose={() => setCreatePersonSearch(null)}
                    onCreated={handlePersonCreated}
                />
            )}
        </>
    );
}

// ── QR Modal ───────────────────────────────────────────────────────────────────

interface QrModalProps {
    registrationId: string;
    name: string;
    onClose: () => void;
}

function QrModal({ registrationId, name, onClose }: QrModalProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const prevUrl = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        registrationService.getQrBlobUrl(registrationId)
            .then((url) => {
                if (!cancelled) {
                    prevUrl.current = url;
                    setBlobUrl(url);
                }
            })
            .catch((e) => {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar QR');
            });
        return () => {
            cancelled = true;
            if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
        };
    }, [registrationId]);

    return (
        <div className="reg-modal-overlay" onClick={onClose}>
            <div className="reg-modal" onClick={(e) => e.stopPropagation()}>
                <div className="reg-modal-header">
                    <div>
                        <h3 className="reg-modal-title">Código QR</h3>
                        <p className="reg-modal-sub">{name}</p>
                    </div>
                    <button className="reg-modal-close" onClick={onClose} aria-label="Cerrar">
                        <IconClose />
                    </button>
                </div>

                <div className="reg-modal-body">
                    {!blobUrl && !error && (
                        <div className="reg-qr-loading">
                            <span className="reg-qr-spinner" />
                            <p>Generando QR...</p>
                        </div>
                    )}
                    {error && (
                        <div className="reg-qr-error">
                            <IconAlert />
                            <p>{error}</p>
                        </div>
                    )}
                    {blobUrl && (
                        <img
                            src={blobUrl}
                            alt={`QR de ${name}`}
                            className="reg-qr-img"
                        />
                    )}
                </div>

                {blobUrl && (
                    <div className="reg-modal-footer">
                        <a
                            href={blobUrl}
                            download={`qr-${registrationId}.png`}
                            className="reg-qr-download"
                        >
                            Descargar PNG
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function RegistrationsPage() {
    const [rows, setRows] = useState<Registration[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [qrModal, setQrModal] = useState<{ id: string; name: string } | null>(null);
    const [addModal, setAddModal] = useState(false);
    const [allStatuses, setAllStatuses] = useState<RegistrationStatus[]>([]);

    useEffect(() => {
        registrationStatusService
            .getRegistrationStatuses({ size_page: 50 })
            .then(res => setAllStatuses(res.data))
            .catch(() => {/* non-blocking */});
    }, []);

    const fetchData = useCallback(async (targetPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await registrationService.getRegistrations({ page: targetPage, size_page: PAGE_SIZE });
            setRows(res.data ?? []);
            setPagination(res.pagination ?? null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar los registros.');
        } finally {
            setLoading(false);
        }
    }, []);

    const { connected: mqttConnected } = useMqttRegistrations(() => fetchData(page));

    useEffect(() => {
        fetchData(page);
    }, [fetchData, page]);

    const handleStatusUpdated = (registrationId: string, newStatus: Status) => {
        setRows(prev => prev.map(r =>
            r.id === registrationId ? { ...r, status: newStatus } : r
        ));
    };

    const filtered = search.trim()
        ? rows.filter((r) => {
            const name = fullName(r.beneficiary.names, r.beneficiary.surname, r.beneficiary.last_name).toLowerCase();
            const doc = r.beneficiary.document.toLowerCase();
            const workshop = r.session.work_shop.name.toLowerCase();
            const q = search.toLowerCase();
            return name.includes(q) || doc.includes(q) || workshop.includes(q);
        })
        : rows;

    const totalPages = pagination?.total_pages ?? 1;

    const handlePage = (p: number) => {
        if (p < 1 || p > totalPages || p === page) return;
        setPage(p);
    };

    const pageNumbers = () => {
        const pages: number[] = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, page + 2);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const COLS = 9;

    return (
        <DashboardLayout title="Inscripciones">
            {/* Header */}
            <div className="reg-header">
                <div className="reg-header-left">
                    <h2>Lista de Inscripciones</h2>
                    <p>
                        {pagination
                            ? `${pagination.total} inscripción${pagination.total !== 1 ? 'es' : ''} en total`
                            : 'Cargando...'}
                    </p>
                </div>
                <div className="reg-header-right">
                    <div className="reg-search-wrap">
                        <span className="reg-search-icon"><IconSearch /></span>
                        <input
                            className="reg-search"
                            type="text"
                            placeholder="Buscar beneficiario, documento..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="reg-add-btn" onClick={() => setAddModal(true)}>
                        <IconPlus />
                        Agregar
                    </button>
                    <button className="reg-reload-btn" onClick={() => fetchData(page)} disabled={loading}>
                        <IconRefresh spinning={loading} />
                        Actualizar
                    </button>
                    <span className="reg-mqtt-status" title={mqttConnected ? 'Tiempo real activo' : 'Sin conexión en tiempo real'}>
                        <span className={`reg-mqtt-dot ${mqttConnected ? 'reg-mqtt-dot--on' : ''}`} />
                        {mqttConnected ? 'En vivo' : 'Sin conexión'}
                    </span>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="reg-error">
                    <IconAlert />
                    {error}
                </div>
            )}

            {/* Status legend */}
            <StatusLegend statuses={allStatuses} />

            {/* Table card */}
            <div className="reg-card">
                <p className="reg-card-title">Inscripciones Registradas</p>

                <div className="reg-table-wrap">
                    <table className="reg-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Beneficiario</th>
                                <th>Documento</th>
                                <th>Taller</th>
                                <th>Sesión</th>
                                <th>Estado</th>
                                <th>Registrado por</th>
                                <th>Fecha</th>
                                <th>QR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && rows.length === 0 ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: COLS }).map((_, j) => (
                                            <td key={j}>
                                                <span className="reg-skeleton" style={{ width: `${60 + (j * 13) % 60}px` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr className="reg-state-row">
                                    <td colSpan={COLS}>
                                        <div className="reg-state-icon"><IconUsers /></div>
                                        <p className="reg-state-title">
                                            {search ? 'Sin resultados' : 'Sin inscripciones'}
                                        </p>
                                        <p className="reg-state-desc">
                                            {search
                                                ? 'No se encontró ningún registro con esa búsqueda.'
                                                : 'No hay inscripciones registradas todavía.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((reg, idx) => {
                                    const b = reg.beneficiary;
                                    const cb = reg.created_by;
                                    const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                                    const name = fullName(b.names, b.surname, b.last_name);

                                    return (
                                        <tr key={reg.id}>
                                            <td style={{ color: 'var(--reg-text-muted)', fontWeight: 600, width: 42 }}>
                                                {rowNum}
                                            </td>
                                            <td>
                                                <div className="reg-beneficiary">
                                                    <div className="reg-avatar">
                                                        {initials(b.names, b.surname)}
                                                    </div>
                                                    <div>
                                                        <div className="reg-beneficiary-name">{name}</div>
                                                        <div className="reg-beneficiary-user">@{b.user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="reg-badge">
                                                    {b.type_document.abbreviated_description} {b.document}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="reg-workshop">
                                                    {reg.session.work_shop.name}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="reg-date">{formatDate(reg.session.start_date)}</div>
                                                <div className="reg-date" style={{ fontSize: 11 }}>
                                                    {formatDate(reg.session.end_date)}
                                                </div>
                                            </td>
                                            <td>
                                                <StatusCell
                                                    registration={reg}
                                                    allStatuses={allStatuses}
                                                    onUpdated={handleStatusUpdated}
                                                />
                                            </td>
                                            <td style={{ color: 'var(--reg-text-secondary)' }}>
                                                {fullName(cb.names, cb.surname, cb.last_name)}
                                            </td>
                                            <td>
                                                <span className="reg-date">{formatDate(reg.created_at)}</span>
                                            </td>
                                            <td>
                                                <button
                                                    className="reg-qr-btn"
                                                    onClick={() => setQrModal({ id: reg.id, name })}
                                                    title="Ver código QR"
                                                >
                                                    <IconQr />
                                                    Ver QR
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.total > 0 && (
                    <div className="reg-pagination">
                        <span className="reg-pagination-info">
                            Página {page} de {totalPages} &mdash; {pagination.total} registros
                        </span>
                        <div className="reg-pagination-btns">
                            <button className="reg-page-btn" onClick={() => handlePage(page - 1)} disabled={page === 1}>
                                <IconChevronLeft />
                            </button>
                            {pageNumbers().map((p) => (
                                <button
                                    key={p}
                                    className={`reg-page-btn ${p === page ? 'reg-page-btn--active' : ''}`}
                                    onClick={() => handlePage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                            <button className="reg-page-btn" onClick={() => handlePage(page + 1)} disabled={page === totalPages}>
                                <IconChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* QR Modal */}
            {qrModal && (
                <QrModal
                    registrationId={qrModal.id}
                    name={qrModal.name}
                    onClose={() => setQrModal(null)}
                />
            )}

            {/* Add Registration Modal */}
            {addModal && (
                <AddRegistrationModal
                    onClose={() => setAddModal(false)}
                    onSuccess={() => {
                        setAddModal(false);
                        fetchData(page);
                    }}
                />
            )}
        </DashboardLayout>
    );
}
