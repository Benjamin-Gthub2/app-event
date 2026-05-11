import { useState, useEffect, useCallback } from 'react';
import { workshopService } from '../../services/workshopService';
import { workshopTypeService } from '../../services/workshopTypeService';
import { eventService } from '../../services/eventService';
import { workshopSpeakerService } from '../../services/workshopSpeakerService';
import { peopleService } from '../../services/peopleService';
import type { Workshop } from '../../types/workshop.types';
import type { WorkshopType } from '../../types/workshopType.types';
import type { Event } from '../../types/event.types';
import type { WorkshopSpeaker } from '../../types/workshopSpeaker.types';
import type { Person } from '../../types/people.types';
import '../ConfiguracionPage.css';

const IconPlus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);
const IconEdit = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);
const IconTrash = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
);
const IconClose = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
const IconX = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

interface WForm {
    name: string; shortname: string; code: string;
    capacity: string; type_id: string; event_id: string;
    start_date: string; end_date: string; place: string;
}
const EMPTY: WForm = { name: '', shortname: '', code: '', capacity: '', type_id: '', event_id: '', start_date: '', end_date: '', place: '' };
const PAGE_SIZE = 10;

function toISO(local: string): string {
    if (!local) return '';
    return new Date(local).toISOString();
}

function toLocal(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function speakerLabel(sp: WorkshopSpeaker) {
    const full = [sp.speaker.names, sp.speaker.surname, sp.speaker.last_name].filter(Boolean).join(' ');
    return full || sp.speaker.document;
}

function personLabel(p: Person) {
    return [p.names, p.surname, p.last_name].filter(Boolean).join(' ') || p.document;
}

export default function TalleresTab() {
    const [rows, setRows]         = useState<Workshop[]>([]);
    const [page, setPage]         = useState(1);
    const [totalPages, setTP]     = useState(1);
    const [total, setTotal]       = useState(0);
    const [filterEvent, setFE]    = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const [events, setEvents]     = useState<Event[]>([]);
    const [wTypes, setWTypes]     = useState<WorkshopType[]>([]);
    const [people, setPeople]     = useState<Person[]>([]);
    const [loadingSelects, setLS] = useState(true);

    // speakers per workshop (workshopId -> WorkshopSpeaker[])
    const [speakersMap, setSpeakersMap] = useState<Record<string, WorkshopSpeaker[]>>({});

    const [modal, setModal]         = useState<'create' | 'edit' | null>(null);
    const [editRow, setEditRow]     = useState<Workshop | null>(null);
    const [deleteId, setDeleteId]   = useState<string | null>(null);
    const [form, setForm]           = useState<WForm>(EMPTY);
    const [saving, setSaving]       = useState(false);
    const [saveErr, setSaveErr]     = useState<string | null>(null);
    const [delErr, setDelErr]       = useState<string | null>(null);

    // speakers state for modal
    const [modalSpeakers, setModalSpeakers]         = useState<WorkshopSpeaker[]>([]); // existing (edit mode)
    const [pendingSpeakers, setPendingSpeakers]     = useState<Person[]>([]);          // pending (create mode)
    const [speakerSearch, setSpeakerSearch]         = useState('');
    const [speakerSearchRes, setSpeakerSearchRes]   = useState<Person[]>([]);
    const [speakerSearching, setSpeakerSearching]   = useState(false);
    const [speakerErr, setSpeakerErr]               = useState<string | null>(null);

    const sf = <K extends keyof WForm>(k: K, v: WForm[K]) => setForm(f => ({ ...f, [k]: v }));

    useEffect(() => {
        Promise.all([
            eventService.getEvents({ size_page: 100 }),
            workshopTypeService.getWorkshopTypes({ size_page: 100 }),
            peopleService.getPeople({ size_page: 300 }),
        ]).then(([evRes, wtRes, pRes]) => {
            setEvents(evRes.data ?? []);
            setWTypes(wtRes.data ?? []);
            setPeople(pRes.data ?? []);
        }).catch(() => {}).finally(() => setLS(false));
    }, []);

    const fetchWorkshops = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await workshopService.getWorkshops({ page, size_page: PAGE_SIZE, event_id: filterEvent || undefined });
            const workshops = res.data ?? [];
            setRows(workshops);
            setTotal(res.pagination.total);
            setTP(res.pagination.total_pages || 1);

            // load speakers for each workshop in parallel
            if (workshops.length > 0) {
                const results = await Promise.allSettled(
                    workshops.map(w => workshopSpeakerService.getWorkshopSpeakers({ workshop_id: w.id, size_page: 100 }))
                );
                const map: Record<string, WorkshopSpeaker[]> = {};
                workshops.forEach((w, i) => {
                    const r = results[i];
                    map[w.id] = r.status === 'fulfilled' ? (r.value.data ?? []) : [];
                });
                setSpeakersMap(map);
            } else {
                setSpeakersMap({});
            }
        } catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar.'); }
        finally { setLoading(false); }
    }, [page, filterEvent]);

    useEffect(() => { fetchWorkshops(); }, [fetchWorkshops]);

    const onFilterEvent = (id: string) => { setFE(id); setPage(1); };

    const openCreate = () => {
        setForm(EMPTY);
        setSaveErr(null);
        setModalSpeakers([]);
        setPendingSpeakers([]);
        setSpeakerSearch('');
        setSpeakerSearchRes([]);
        setSpeakerErr(null);
        setModal('create');
    };

    const openEdit = (w: Workshop) => {
        setEditRow(w);
        setForm({
            name: w.name,
            shortname: w.shortname ?? '',
            code: w.code ?? '',
            capacity: String(w.capacity),
            type_id: w.workshop_type?.id ?? '',
            event_id: w.event?.id ?? '',
            start_date: toLocal(w.start_date),
            end_date: toLocal(w.end_date),
            place: w.place ?? '',
        });
        setSaveErr(null);
        setPendingSpeakers([]);
        setSpeakerSearch('');
        setSpeakerSearchRes([]);
        setSpeakerErr(null);
        // load existing speakers
        const existing = speakersMap[w.id] ?? [];
        setModalSpeakers(existing);
        setModal('edit');
    };

    const closeModal = () => { setModal(null); setEditRow(null); };

    // speaker search (client-side filter from preloaded people)
    const handleSpeakerSearch = (q: string) => {
        setSpeakerSearch(q);
        if (!q.trim()) { setSpeakerSearchRes([]); return; }
        setSpeakerSearching(true);
        const lower = q.toLowerCase();
        const results = people.filter(p => {
            const label = personLabel(p).toLowerCase();
            return label.includes(lower) || p.document.includes(q);
        }).slice(0, 10);
        setSpeakerSearchRes(results);
        setSpeakerSearching(false);
    };

    const addSpeakerCreate = (p: Person) => {
        const alreadyPending = pendingSpeakers.some(s => s.id === p.id);
        const alreadyModal   = modalSpeakers.some(s => s.speaker.id === p.id);
        if (alreadyPending || alreadyModal) return;
        setPendingSpeakers(prev => [...prev, p]);
        setSpeakerSearch('');
        setSpeakerSearchRes([]);
    };

    const removePendingSpeaker = (id: string) => {
        setPendingSpeakers(prev => prev.filter(p => p.id !== id));
    };

    const addSpeakerEdit = async (p: Person) => {
        if (!editRow) return;
        const alreadyModal   = modalSpeakers.some(s => s.speaker.id === p.id);
        const alreadyPending = pendingSpeakers.some(s => s.id === p.id);
        if (alreadyModal || alreadyPending) return;
        setSpeakerErr(null);
        try {
            await workshopSpeakerService.createWorkshopSpeaker({ workshop_id: editRow.id, speaker_id: p.id });
            const res = await workshopSpeakerService.getWorkshopSpeakers({ workshop_id: editRow.id, size_page: 100 });
            setModalSpeakers(res.data ?? []);
            setSpeakersMap(prev => ({ ...prev, [editRow.id]: res.data ?? [] }));
        } catch (e) { setSpeakerErr(e instanceof Error ? e.message : 'Error al agregar ponente.'); }
        setSpeakerSearch('');
        setSpeakerSearchRes([]);
    };

    const removeSpeakerEdit = async (ws: WorkshopSpeaker) => {
        if (!editRow) return;
        setSpeakerErr(null);
        try {
            await workshopSpeakerService.deleteWorkshopSpeaker(ws.id);
            setModalSpeakers(prev => prev.filter(s => s.id !== ws.id));
            setSpeakersMap(prev => ({ ...prev, [editRow.id]: (prev[editRow.id] ?? []).filter(s => s.id !== ws.id) }));
        } catch (e) { setSpeakerErr(e instanceof Error ? e.message : 'Error al eliminar ponente.'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setSaveErr(null);
        try {
            const cap = parseInt(form.capacity, 10) || 0;
            const body = {
                name: form.name,
                shortname: form.shortname || undefined,
                code: form.code || undefined,
                capacity: cap,
                type_id: form.type_id,
                start_date: toISO(form.start_date),
                end_date: toISO(form.end_date),
                place: form.place,
            };
            if (modal === 'create') {
                const newId = await workshopService.createWorkshop({ ...body, event_id: form.event_id });
                // post pending speakers
                if (pendingSpeakers.length > 0) {
                    await Promise.allSettled(
                        pendingSpeakers.map(p => workshopSpeakerService.createWorkshopSpeaker({ workshop_id: newId, speaker_id: p.id }))
                    );
                }
            } else if (editRow) {
                await workshopService.updateWorkshop(editRow.id, body);
            }
            closeModal(); fetchWorkshops();
        } catch (e) { setSaveErr(e instanceof Error ? e.message : 'Error al guardar.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return; setSaving(true); setDelErr(null);
        try {
            await workshopService.deleteWorkshop(deleteId);
            setDeleteId(null);
            if (rows.length === 1 && page > 1) setPage(p => p - 1); else fetchWorkshops();
        } catch (e) { setDelErr(e instanceof Error ? e.message : 'Error al eliminar.'); }
        finally { setSaving(false); }
    };

    return (
        <div>
            <div className="cfg-toolbar">
                <div className="cfg-toolbar-left">
                    <select className="cfg-search-input" style={{ maxWidth: 240 }} value={filterEvent} onChange={e => onFilterEvent(e.target.value)}>
                        <option value="">Todos los eventos...</option>
                        {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                    </select>
                    {filterEvent && <button className="cfg-btn-ghost" onClick={() => onFilterEvent('')}>× Limpiar</button>}
                </div>
                <button className="cfg-btn-success" onClick={openCreate} disabled={loadingSelects}><IconPlus /> Agregar Taller</button>
            </div>

            {error && <div className="cfg-error">{error}</div>}

            <div className="cfg-card">
                <div className="cfg-card-head">
                    <span className="cfg-card-title">Talleres</span>
                    <span className="cfg-card-count">{total} registro{total !== 1 ? 's' : ''}</span>
                </div>
                <div className="cfg-table-wrap">
                    <table className="cfg-table">
                        <thead><tr><th>#</th><th>Nombre</th><th>Código</th><th>Capacidad</th><th>Tipo</th><th>Evento</th><th>Fecha Inicio</th><th>Ponentes</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>{[100, 150, 70, 60, 90, 110, 100, 80, 60].map((w, j) => <td key={j}><span className="cfg-skeleton" style={{ width: w }} /></td>)}</tr>
                            )) : rows.length === 0 ? (
                                <tr className="cfg-state-row"><td colSpan={9}>No hay talleres registrados.</td></tr>
                            ) : rows.map((w, idx) => {
                                const speakers = speakersMap[w.id] ?? [];
                                return (
                                    <tr key={w.id}>
                                        <td><span className="cfg-num">{(page - 1) * PAGE_SIZE + idx + 1}</span></td>
                                        <td>
                                            <div className="cfg-cell-name">{w.name}</div>
                                            {w.shortname && <div className="cfg-cell-sub">{w.shortname}</div>}
                                        </td>
                                        <td>{w.code ? <span className="cfg-badge-code">{w.code}</span> : <span className="cfg-cell-sub">—</span>}</td>
                                        <td><span className="cfg-cell-name">{w.capacity}</span></td>
                                        <td><span className="cfg-cell-sub">{w.workshop_type?.description ?? '—'}</span></td>
                                        <td><span className="cfg-cell-sub">{w.event?.name ?? '—'}</span></td>
                                        <td><span className="cfg-cell-sub">{w.start_date ? new Date(w.start_date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</span></td>
                                        <td>
                                            {speakers.length === 0
                                                ? <span className="cfg-cell-sub">—</span>
                                                : <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    {speakers.map(s => (
                                                        <span key={s.id} className="cfg-badge-code" style={{ fontSize: 11 }}>{speakerLabel(s)}</span>
                                                    ))}
                                                </div>
                                            }
                                        </td>
                                        <td>
                                            <div className="cfg-actions">
                                                <button className="cfg-btn-icon cfg-btn-icon--edit" title="Editar" onClick={() => openEdit(w)}><IconEdit /></button>
                                                <button className="cfg-btn-icon cfg-btn-icon--delete" title="Eliminar" onClick={() => { setDeleteId(w.id); setDelErr(null); }}><IconTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="cfg-pagination">
                        <span className="cfg-pagination-info">Página {page} de {totalPages} · {total} total</span>
                        <div className="cfg-pagination-btns">
                            <button className="cfg-page-btn" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>‹</button>
                            <span className="cfg-page-btn cfg-page-btn--active">{page}</span>
                            <button className="cfg-page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>›</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create / Edit modal */}
            {modal && (
                <div className="cfg-overlay" onClick={closeModal}>
                    <div className="cfg-modal" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
                        <div className="cfg-modal-head">
                            <h3>{modal === 'create' ? 'Agregar Taller' : 'Editar Taller'}</h3>
                            <button className="cfg-modal-close" onClick={closeModal}><IconClose /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="cfg-modal-body">
                                {saveErr && <div className="cfg-save-error">{saveErr}</div>}
                                <div className="cfg-form-grid">
                                    <div className="cfg-form-group cfg-form-group--full">
                                        <label>Nombre *</label>
                                        <input className="cfg-form-input" value={form.name} onChange={e => sf('name', e.target.value)} required placeholder="Nombre del taller" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Nombre Corto</label>
                                        <input className="cfg-form-input" value={form.shortname} onChange={e => sf('shortname', e.target.value)} placeholder="Ej: TALLER-A" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Código</label>
                                        <input className="cfg-form-input" value={form.code} onChange={e => sf('code', e.target.value)} placeholder="Ej: T001" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Capacidad *</label>
                                        <input className="cfg-form-input" type="number" min="1" value={form.capacity} onChange={e => sf('capacity', e.target.value)} required placeholder="Ej: 50" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Tipo de Taller *</label>
                                        <select className="cfg-form-select" value={form.type_id} onChange={e => sf('type_id', e.target.value)} required>
                                            <option value="">Seleccionar...</option>
                                            {wTypes.map(t => <option key={t.id} value={t.id}>{t.description}</option>)}
                                        </select>
                                    </div>
                                    <div className="cfg-form-group cfg-form-group--full">
                                        <label>Lugar *</label>
                                        <input className="cfg-form-input" value={form.place} onChange={e => sf('place', e.target.value)} required placeholder="Ej: Sala A - Piso 2" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Fecha de Inicio *</label>
                                        <input className="cfg-form-input" type="datetime-local" value={form.start_date} onChange={e => sf('start_date', e.target.value)} required />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Fecha de Fin *</label>
                                        <input className="cfg-form-input" type="datetime-local" value={form.end_date} onChange={e => sf('end_date', e.target.value)} required />
                                    </div>
                                    {modal === 'create' && (
                                        <div className="cfg-form-group cfg-form-group--full">
                                            <label>Evento *</label>
                                            <select className="cfg-form-select" value={form.event_id} onChange={e => sf('event_id', e.target.value)} required>
                                                <option value="">Seleccionar...</option>
                                                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Ponentes section */}
                                <div style={{ marginTop: 20 }}>
                                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13, color: 'var(--cfg-text-primary)' }}>Ponentes</label>

                                    {speakerErr && <div className="cfg-save-error" style={{ marginBottom: 8 }}>{speakerErr}</div>}

                                    {/* current speakers list */}
                                    {(modal === 'create' ? pendingSpeakers.length > 0 : modalSpeakers.length > 0) && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                                            {modal === 'create'
                                                ? pendingSpeakers.map(p => (
                                                    <span key={p.id} className="cfg-speaker-tag">
                                                        {personLabel(p)}
                                                        <button type="button" className="cfg-speaker-tag-remove" onClick={() => removePendingSpeaker(p.id)} title="Quitar"><IconX /></button>
                                                    </span>
                                                ))
                                                : modalSpeakers.map(s => (
                                                    <span key={s.id} className="cfg-speaker-tag">
                                                        {speakerLabel(s)}
                                                        <button type="button" className="cfg-speaker-tag-remove" onClick={() => removeSpeakerEdit(s)} title="Quitar"><IconX /></button>
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    )}

                                    {/* search input */}
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className="cfg-form-input"
                                            placeholder="Buscar ponente por nombre o documento..."
                                            value={speakerSearch}
                                            onChange={e => handleSpeakerSearch(e.target.value)}
                                            autoComplete="off"
                                        />
                                        {speakerSearch && speakerSearchRes.length > 0 && (
                                            <div className="cfg-speaker-dropdown">
                                                {speakerSearching
                                                    ? <div className="cfg-speaker-dropdown-item cfg-speaker-dropdown-item--info">Buscando...</div>
                                                    : speakerSearchRes.map(p => {
                                                        const alreadyCreate = pendingSpeakers.some(s => s.id === p.id);
                                                        const alreadyEdit   = modalSpeakers.some(s => s.speaker.id === p.id);
                                                        const disabled = alreadyCreate || alreadyEdit;
                                                        return (
                                                            <div
                                                                key={p.id}
                                                                className={`cfg-speaker-dropdown-item${disabled ? ' cfg-speaker-dropdown-item--disabled' : ''}`}
                                                                onClick={() => {
                                                                    if (disabled) return;
                                                                    if (modal === 'create') addSpeakerCreate(p);
                                                                    else addSpeakerEdit(p);
                                                                }}
                                                            >
                                                                <span>{personLabel(p)}</span>
                                                                <span style={{ fontSize: 11, color: 'var(--cfg-text-secondary)' }}>{p.document}</span>
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>
                                        )}
                                        {speakerSearch && !speakerSearching && speakerSearchRes.length === 0 && (
                                            <div className="cfg-speaker-dropdown">
                                                <div className="cfg-speaker-dropdown-item cfg-speaker-dropdown-item--info">Sin resultados</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="cfg-modal-footer">
                                <button type="button" className="cfg-btn-ghost" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="cfg-btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteId && (
                <div className="cfg-overlay" onClick={() => setDeleteId(null)}>
                    <div className="cfg-modal cfg-modal--sm" onClick={e => e.stopPropagation()}>
                        <div className="cfg-modal-head">
                            <h3>Eliminar Taller</h3>
                            <button className="cfg-modal-close" onClick={() => setDeleteId(null)}><IconClose /></button>
                        </div>
                        <div className="cfg-modal-body">
                            {delErr && <div className="cfg-save-error">{delErr}</div>}
                            <p style={{ margin: 0, color: 'var(--cfg-text-secondary)' }}>¿Deseas eliminar este taller? Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="cfg-modal-footer">
                            <button className="cfg-btn-ghost" onClick={() => setDeleteId(null)}>Cancelar</button>
                            <button className="cfg-btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
