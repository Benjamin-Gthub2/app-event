import { useState, useEffect, useCallback } from 'react';
import { workshopService } from '../../services/workshopService';
import { workshopTypeService } from '../../services/workshopTypeService';
import { eventService } from '../../services/eventService';
import type { Workshop } from '../../types/workshop.types';
import type { WorkshopType } from '../../types/workshopType.types';
import type { Event } from '../../types/event.types';
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

interface WForm {
    name: string; shortname: string; code: string;
    capacity: string; type_id: string; event_id: string;
}
const EMPTY: WForm = { name: '', shortname: '', code: '', capacity: '', type_id: '', event_id: '' };
const PAGE_SIZE = 10;

export default function TalleresTab() {
    const [rows, setRows]         = useState<Workshop[]>([]);
    const [page, setPage]         = useState(1);
    const [totalPages, setTP]     = useState(1);
    const [total, setTotal]       = useState(0);
    const [filterEvent, setFE]    = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const [events, setEvents]           = useState<Event[]>([]);
    const [wTypes, setWTypes]           = useState<WorkshopType[]>([]);
    const [loadingSelects, setLS]       = useState(true);

    const [modal, setModal]         = useState<'create' | 'edit' | null>(null);
    const [editRow, setEditRow]     = useState<Workshop | null>(null);
    const [deleteId, setDeleteId]   = useState<string | null>(null);
    const [form, setForm]           = useState<WForm>(EMPTY);
    const [saving, setSaving]       = useState(false);
    const [saveErr, setSaveErr]     = useState<string | null>(null);
    const [delErr, setDelErr]       = useState<string | null>(null);

    const sf = <K extends keyof WForm>(k: K, v: WForm[K]) => setForm(f => ({ ...f, [k]: v }));

    useEffect(() => {
        Promise.all([
            eventService.getEvents({ size_page: 100 }),
            workshopTypeService.getWorkshopTypes({ size_page: 100 }),
        ]).then(([evRes, wtRes]) => {
            setEvents(evRes.data ?? []);
            setWTypes(wtRes.data ?? []);
        }).catch(() => {}).finally(() => setLS(false));
    }, []);

    const fetchWorkshops = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await workshopService.getWorkshops({ page, size_page: PAGE_SIZE, event_id: filterEvent || undefined });
            setRows(res.data ?? []);
            setTotal(res.pagination.total);
            setTP(res.pagination.total_pages || 1);
        } catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar.'); }
        finally { setLoading(false); }
    }, [page, filterEvent]);

    useEffect(() => { fetchWorkshops(); }, [fetchWorkshops]);

    const onFilterEvent = (id: string) => { setFE(id); setPage(1); };

    const openCreate = () => { setForm(EMPTY); setSaveErr(null); setModal('create'); };
    const openEdit   = (w: Workshop) => {
        setEditRow(w);
        setForm({ name: w.name, shortname: w.shortname ?? '', code: w.code ?? '', capacity: String(w.capacity), type_id: w.workshop_type?.id ?? '', event_id: w.event?.id ?? '' });
        setSaveErr(null); setModal('edit');
    };
    const closeModal = () => { setModal(null); setEditRow(null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setSaveErr(null);
        try {
            const cap = parseInt(form.capacity, 10) || 0;
            if (modal === 'create') {
                await workshopService.createWorkshop({ name: form.name, shortname: form.shortname || undefined, code: form.code || undefined, capacity: cap, type_id: form.type_id, event_id: form.event_id });
            } else if (editRow) {
                await workshopService.updateWorkshop(editRow.id, { name: form.name, shortname: form.shortname || undefined, code: form.code || undefined, capacity: cap, type_id: form.type_id });
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
                        <thead><tr><th>#</th><th>Nombre</th><th>Código</th><th>Capacidad</th><th>Tipo</th><th>Evento</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>{[100, 150, 70, 60, 90, 110, 60].map((w, j) => <td key={j}><span className="cfg-skeleton" style={{ width: w }} /></td>)}</tr>
                            )) : rows.length === 0 ? (
                                <tr className="cfg-state-row"><td colSpan={7}>No hay talleres registrados.</td></tr>
                            ) : rows.map((w, idx) => (
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
                                    <td>
                                        <div className="cfg-actions">
                                            <button className="cfg-btn-icon cfg-btn-icon--edit" title="Editar" onClick={() => openEdit(w)}><IconEdit /></button>
                                            <button className="cfg-btn-icon cfg-btn-icon--delete" title="Eliminar" onClick={() => { setDeleteId(w.id); setDelErr(null); }}><IconTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
                    <div className="cfg-modal" onClick={e => e.stopPropagation()}>
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
