import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { registrationService } from '../services/registrationService';
import { registrationStatusService } from '../services/registrationStatusService';
import { eventService } from '../services/eventService';
import { peopleService } from '../services/peopleService';
import type { CreatePersonBody } from '../services/peopleService';
import { SearchableSelect } from '../components/SearchableSelect';
import type { Registration, Pagination, Status } from '../types/registration.types';
import type { RegistrationStatus } from '../types/registrationStatus.types';
import type { Event } from '../types/event.types';
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

const IconWhatsApp = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

const IconPlus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const IconCertificate = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
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
        timeZone: 'America/Lima',
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
    const [eventId, setEventId] = useState('');
    const [personId, setPersonId] = useState('');

    const [events, setEvents] = useState<Event[]>([]);
    const [people, setPeople] = useState<Person[]>([]);

    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingPeople, setLoadingPeople] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [createPersonSearch, setCreatePersonSearch] = useState<string | null>(null);

    useEffect(() => {
        eventService.getEvents({ size_page: 100 })
            .then((res) => setEvents(res.data ?? []))
            .catch(() => setEvents([]))
            .finally(() => setLoadingEvents(false));

        peopleService.getPeople({ size_page: 1000 })
            .then((res) => setPeople(res.data ?? []))
            .catch(() => setPeople([]))
            .finally(() => setLoadingPeople(false));
    }, []);

    const eventOptions: SelectOption[] = events.map((e) => ({
        value: e.id,
        label: e.name,
        sublabel: e.code ?? undefined,
    }));

    const personOptions: SelectOption[] = people.map((p) => ({
        value: p.id,
        label: [p.names, p.surname, p.last_name].filter(Boolean).join(' '),
        sublabel: `${p.document_type.abbreviated_description} ${p.document}`,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventId || !personId) return;
        setSaving(true);
        setFormError(null);
        try {
            await registrationService.createRegistration({ event_id: eventId, beneficiary_id: personId });
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
                                Evento <span className="reg-required">*</span>
                            </label>
                            <SearchableSelect
                                options={eventOptions}
                                value={eventId}
                                onChange={(v) => setEventId(v)}
                                placeholder="Seleccionar evento..."
                                searchPlaceholder="Buscar evento..."
                                loading={loadingEvents}
                                emptyText="Sin eventos disponibles"
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
                                disabled={!eventId || !personId || saving}
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
                            <p>Obteniendo QR...</p>
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

// ── WhatsApp QR Modal ──────────────────────────────────────────────────────────

interface WhatsAppModalProps {
    registrationId: string;
    name: string;
    initialPhone: string;
    onClose: () => void;
    onSuccess: () => void;
}

function WhatsAppModal({ registrationId, name, initialPhone, onClose, onSuccess }: WhatsAppModalProps) {
    const [phone, setPhone] = useState(initialPhone);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);
        try {
            await registrationService.sendQrWhatsApp(registrationId, phone.trim());
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al enviar el QR.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="reg-modal-overlay" onClick={onClose}>
            <div className="reg-modal" onClick={(e) => e.stopPropagation()}>
                <div className="reg-modal-header">
                    <div>
                        <h3 className="reg-modal-title">Enviar QR por WhatsApp</h3>
                        <p className="reg-modal-sub">{name}</p>
                    </div>
                    <button className="reg-modal-close" onClick={onClose} aria-label="Cerrar" type="button">
                        <IconClose />
                    </button>
                </div>
                <form className="reg-form-body" onSubmit={handleSend}>
                    {error && (
                        <div className="reg-form-alert">
                            <IconAlert />
                            {error}
                        </div>
                    )}
                    <div className="reg-form-field">
                        <label className="reg-form-label">
                            Número WhatsApp <span className="reg-required">*</span>
                        </label>
                        <input
                            className="reg-form-input"
                            placeholder="Ej: 51987654321"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            autoFocus
                        />
                        <span className="reg-phone-hint">Incluye el código de país sin + (ej: 51 para Perú)</span>
                    </div>
                    <div className="reg-form-actions">
                        <button type="button" className="reg-form-cancel" onClick={onClose} disabled={sending}>
                            Cancelar
                        </button>
                        <button type="submit" className="reg-form-submit reg-form-submit--whatsapp" disabled={sending || !phone.trim()}>
                            <IconWhatsApp />
                            {sending ? 'Enviando...' : 'Enviar QR'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function RegistrationsPage() {
    const [rows, setRows] = useState<Registration[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [qrModal, setQrModal] = useState<{ id: string; name: string } | null>(null);
    const [whatsappModal, setWhatsappModal] = useState<{ id: string; name: string; phone: string } | null>(null);
    const [addModal, setAddModal] = useState(false);
    const [allStatuses, setAllStatuses] = useState<RegistrationStatus[]>([]);
    const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);

    useEffect(() => {
        registrationStatusService
            .getRegistrationStatuses({ size_page: 50 })
            .then(res => setAllStatuses(res.data))
            .catch(() => {/* non-blocking */});
    }, []);

    useEffect(() => {
        const t = setTimeout(() => { setActiveSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const fetchData = useCallback(async (targetPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await registrationService.getRegistrations({
                page: targetPage,
                size_page: pageSize,
                searchvalue: activeSearch.trim() || undefined,
            });
            setRows(res.data ?? []);
            setPagination(res.pagination ?? null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar los registros.');
        } finally {
            setLoading(false);
        }
    }, [pageSize, activeSearch]);

    const { connected: mqttConnected } = useMqttRegistrations(() => fetchData(page));

    useEffect(() => {
        fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData]);

    const handleStatusUpdated = (registrationId: string, newStatus: Status) => {
        setRows(prev => prev.map(r =>
            r.id === registrationId ? { ...r, status: newStatus } : r
        ));
    };

    const handleSendQrUpdated = (registrationId: string) => {
        setRows(prev => prev.map(r =>
            r.id === registrationId ? { ...r, send_qr: true } : r
        ));
    };

    const handleDownloadCertificate = async (reg: Registration) => {
        if (downloadingCertId !== null) return;
        setDownloadingCertId(reg.id);
        try {
            await registrationService.downloadCertificatePdf(reg.id);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al generar el certificado.');
        } finally {
            setDownloadingCertId(null);
        }
    };

    const totalPages = Math.max(pagination?.last_page ?? 1, 1);

    const handlePage = (p: number) => {
        if (p < 1 || p > totalPages || p === page) return;
        setPage(p);
        fetchData(p);
    };

    const pageNumbers = () => {
        const pages: number[] = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, page + 2);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const COLS = 11;

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
                                <th>Evento</th>
                                <th>Estado</th>
                                <th>Registrado por</th>
                                <th>Fecha</th>
                                <th>Teléfono</th>
                                <th>QR WhatsApp</th>
                                <th>Certificado</th>
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
                            ) : rows.length === 0 ? (
                                <tr className="reg-state-row">
                                    <td colSpan={COLS as number}>
                                        <div className="reg-state-icon"><IconUsers /></div>
                                        <p className="reg-state-title">
                                            {activeSearch ? 'Sin resultados' : 'Sin inscripciones'}
                                        </p>
                                        <p className="reg-state-desc">
                                            {activeSearch
                                                ? 'No se encontró ningún registro con esa búsqueda.'
                                                : 'No hay inscripciones registradas todavía.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                rows.map((reg, idx) => {
                                    const b = reg.beneficiary;
                                    const cb = reg.created_by;
                                    const rowNum = (page - 1) * pageSize + idx + 1;
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
                                                    {reg.event.name}
                                                </span>
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
                                                <span>
                                                    <b>
                                                        {b.phone}
                                                    </b>
                                                </span>
                                            </td>
                                            {/*<td>*/}
                                            {/*    {b.type_document.abbreviated_description=='DNI'?(*/}
                                            {/*        reg.send_qr ? (*/}
                                            {/*            <span className="reg-send-badge reg-send-badge--sent"> <IconWhatsApp />Enviado</span>*/}
                                            {/*        ) : (*/}
                                            {/*            <button*/}
                                            {/*                className="reg-send-badge reg-send-badge--pending"*/}
                                            {/*                onClick={() => setWhatsappModal({ id: reg.id, name, phone: b.phone? "51"+b.phone: '' })}*/}
                                            {/*                title="Enviar QR por WhatsApp"*/}
                                            {/*            >*/}
                                            {/*                <IconWhatsApp />*/}
                                            {/*                No enviado*/}
                                            {/*            </button>*/}
                                            {/*            // <span className="reg-send-badge">Deshabilitado por ahora</span>*/}
                                            {/*        )*/}
                                            {/*    ):(*/}
                                            {/*        <span className="reg-send-badge">Deshabilitado por ahora</span>*/}
                                            {/*    )}*/}
                                            {/*</td>*/}
                                            <td>
                                                {b.type_document.abbreviated_description=='DNI'?(
                                                    reg.send_qr ? (
                                                        <button
                                                            className="reg-send-badge reg-send-badge--sent"
                                                            onClick={() => setWhatsappModal({ id: reg.id, name, phone: b.phone ? "51" + b.phone : '' })}
                                                            title="Reenviar QR por WhatsApp"
                                                        >
                                                            <IconWhatsApp />Enviado
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="reg-send-badge reg-send-badge--pending"
                                                            onClick={() => setWhatsappModal({ id: reg.id, name, phone: b.phone ? "51" + b.phone : '' })}
                                                            title="Enviar QR por WhatsApp"
                                                        >
                                                            <IconWhatsApp />
                                                            No enviado
                                                        </button>
                                                    )
                                                ):(
                                                    <span className="reg-send-badge">Deshabilitado por ahora</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className={`reg-cert-btn${downloadingCertId === reg.id ? ' reg-cert-btn--loading' : ''}`}
                                                    onClick={() => handleDownloadCertificate(reg)}
                                                    disabled={downloadingCertId !== null}
                                                    title={`Descargar certificado de ${name}`}
                                                >
                                                    {downloadingCertId === reg.id
                                                        ? <span className="reg-cert-spinner" />
                                                        : <IconCertificate />}
                                                    {downloadingCertId === reg.id ? 'Generando...' : 'Descargar'}
                                                </button>
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
                        <div className="reg-pagination-size">
                            <span>Filas:</span>
                            <select
                                className="reg-page-size-select"
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            >
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={1000}>1000</option>
                            </select>
                        </div>
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

            {/* WhatsApp QR Modal */}
            {whatsappModal && (
                <WhatsAppModal
                    registrationId={whatsappModal.id}
                    name={whatsappModal.name}
                    initialPhone={whatsappModal.phone}
                    onClose={() => setWhatsappModal(null)}
                    onSuccess={() => {
                        handleSendQrUpdated(whatsappModal.id);
                        setWhatsappModal(null);
                    }}
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
