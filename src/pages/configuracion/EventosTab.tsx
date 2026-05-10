import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../../services/eventService';
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
const IconToggle = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
);

interface EForm {
    name: string; description: string; code: string;
    document: string; address: string; industry: string;
    phone: string; enable: boolean;
}
const EMPTY: EForm = { name: '', description: '', code: '', document: '', address: '', industry: '', phone: '', enable: true };
const PAGE_SIZE = 10;

export default function EventosTab() {
    const [rows, setRows]         = useState<Event[]>([]);
    const [page, setPage]         = useState(1);
    const [totalPages, setTP]     = useState(1);
    const [total, setTotal]       = useState(0);
    const [searchInput, setSI]    = useState('');
    const [activeQ, setAQ]        = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const [modal, setModal]       = useState<'create' | 'edit' | null>(null);
    const [editRow, setEditRow]   = useState<Event | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [form, setForm]         = useState<EForm>(EMPTY);
    const [saving, setSaving]     = useState(false);
    const [saveErr, setSaveErr]   = useState<string | null>(null);
    const [delErr, setDelErr]     = useState<string | null>(null);

    const sf = <K extends keyof EForm>(k: K, v: EForm[K]) => setForm(f => ({ ...f, [k]: v }));

    const fetchEvents = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await eventService.getEvents({ page, size_page: PAGE_SIZE, name_or_document: activeQ || undefined });
            setRows(res.data ?? []);
            setTotal(res.pagination.total);
            setTP(res.pagination.total_pages || 1);
        } catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar.'); }
        finally { setLoading(false); }
    }, [page, activeQ]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const doSearch  = () => { setPage(1); setAQ(searchInput); };
    const clearSearch = () => { setSI(''); setPage(1); setAQ(''); };

    const openCreate = () => { setForm(EMPTY); setSaveErr(null); setModal('create'); };
    const openEdit   = (ev: Event) => {
        setEditRow(ev);
        setForm({ name: ev.name, description: ev.description, code: ev.code ?? '', document: '', address: '', industry: '', phone: '', enable: ev.enable });
        setSaveErr(null); setModal('edit');
    };
    const closeModal = () => { setModal(null); setEditRow(null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setSaveErr(null);
        try {
            const body = { name: form.name, description: form.description, code: form.code, document: form.document, address: form.address, industry: form.industry, phone: form.phone || undefined, enable: form.enable };
            if (modal === 'create') await eventService.createEvent(body);
            else if (editRow) await eventService.updateEvent(editRow.id, body);
            closeModal(); fetchEvents();
        } catch (e) { setSaveErr(e instanceof Error ? e.message : 'Error al guardar.'); }
        finally { setSaving(false); }
    };

    const handleToggle = async (ev: Event) => {
        try { await eventService.toggleEventEnable(ev.id, !ev.enable); fetchEvents(); }
        catch { /* ignore */ }
    };

    const handleDelete = async () => {
        if (!deleteId) return; setSaving(true); setDelErr(null);
        try {
            await eventService.deleteEvent(deleteId);
            setDeleteId(null);
            if (rows.length === 1 && page > 1) setPage(p => p - 1); else fetchEvents();
        } catch (e) { setDelErr(e instanceof Error ? e.message : 'Error al eliminar.'); }
        finally { setSaving(false); }
    };

    return (
        <div>
            <div className="cfg-toolbar">
                <div className="cfg-toolbar-left">
                    <input className="cfg-search-input" placeholder="Buscar por nombre o documento..." value={searchInput} onChange={e => setSI(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} />
                    <button className="cfg-btn-ghost" onClick={doSearch}>Buscar</button>
                    {activeQ && <button className="cfg-btn-ghost" onClick={clearSearch}>× Limpiar</button>}
                </div>
                <button className="cfg-btn-success" onClick={openCreate}><IconPlus /> Agregar Evento</button>
            </div>

            {error && <div className="cfg-error">{error}</div>}

            <div className="cfg-card">
                <div className="cfg-card-head">
                    <span className="cfg-card-title">Eventos</span>
                    <span className="cfg-card-count">{total} registro{total !== 1 ? 's' : ''}</span>
                </div>
                <div className="cfg-table-wrap">
                    <table className="cfg-table">
                        <thead><tr><th>#</th><th>Nombre</th><th>Código</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>{[100, 160, 70, 200, 70, 80].map((w, j) => <td key={j}><span className="cfg-skeleton" style={{ width: w }} /></td>)}</tr>
                            )) : rows.length === 0 ? (
                                <tr className="cfg-state-row"><td colSpan={6}>No hay eventos registrados.</td></tr>
                            ) : rows.map((ev, idx) => (
                                <tr key={ev.id}>
                                    <td><span className="cfg-num">{(page - 1) * PAGE_SIZE + idx + 1}</span></td>
                                    <td><div className="cfg-cell-name">{ev.name}</div></td>
                                    <td>{ev.code ? <span className="cfg-badge-code">{ev.code}</span> : <span className="cfg-cell-sub">—</span>}</td>
                                    <td>
                                        <div className="cfg-cell-sub" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {ev.description}
                                        </div>
                                    </td>
                                    <td>{ev.enable ? <span className="cfg-badge-enable">Activo</span> : <span className="cfg-badge-disable">Inactivo</span>}</td>
                                    <td>
                                        <div className="cfg-actions">
                                            <button className="cfg-btn-icon cfg-btn-icon--toggle" title={ev.enable ? 'Desactivar' : 'Activar'} onClick={() => handleToggle(ev)}><IconToggle /></button>
                                            <button className="cfg-btn-icon cfg-btn-icon--edit" title="Editar" onClick={() => openEdit(ev)}><IconEdit /></button>
                                            <button className="cfg-btn-icon cfg-btn-icon--delete" title="Eliminar" onClick={() => { setDeleteId(ev.id); setDelErr(null); }}><IconTrash /></button>
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
                            <h3>{modal === 'create' ? 'Agregar Evento' : 'Editar Evento'}</h3>
                            <button className="cfg-modal-close" onClick={closeModal}><IconClose /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="cfg-modal-body">
                                {saveErr && <div className="cfg-save-error">{saveErr}</div>}
                                {modal === 'edit' && (
                                    <div className="cfg-warn">
                                        Completa todos los campos requeridos al actualizar. Los datos de organización (documento, dirección, industria) deben reingresarse.
                                    </div>
                                )}
                                <div className="cfg-form-grid">
                                    <div className="cfg-form-group cfg-form-group--full">
                                        <label>Nombre *</label>
                                        <input className="cfg-form-input" value={form.name} onChange={e => sf('name', e.target.value)} required placeholder="Nombre del evento" />
                                    </div>
                                    <div className="cfg-form-group cfg-form-group--full">
                                        <label>Descripción *</label>
                                        <textarea className="cfg-form-textarea" value={form.description} onChange={e => sf('description', e.target.value)} required placeholder="Descripción del evento" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Código *</label>
                                        <input className="cfg-form-input" value={form.code} onChange={e => sf('code', e.target.value)} required placeholder="Ej: EVT-2026" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Teléfono</label>
                                        <input className="cfg-form-input" type="tel" value={form.phone} onChange={e => sf('phone', e.target.value)} placeholder="+51 999 999 999" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Documento *</label>
                                        <input className="cfg-form-input" value={form.document} onChange={e => sf('document', e.target.value)} required placeholder="RUC o documento" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Industria *</label>
                                        <input className="cfg-form-input" value={form.industry} onChange={e => sf('industry', e.target.value)} required placeholder="Ej: Educación" />
                                    </div>
                                    <div className="cfg-form-group cfg-form-group--full">
                                        <label>Dirección *</label>
                                        <input className="cfg-form-input" value={form.address} onChange={e => sf('address', e.target.value)} required placeholder="Dirección del evento" />
                                    </div>
                                    <div className="cfg-form-group cfg-form-group--full">
                                        <div className="cfg-form-toggle">
                                            <input type="checkbox" id="ev-enable" className="cfg-toggle-input" checked={form.enable} onChange={e => sf('enable', e.target.checked)} />
                                            <label htmlFor="ev-enable" className="cfg-toggle-label">Evento activo</label>
                                        </div>
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
                            <h3>Eliminar Evento</h3>
                            <button className="cfg-modal-close" onClick={() => setDeleteId(null)}><IconClose /></button>
                        </div>
                        <div className="cfg-modal-body">
                            {delErr && <div className="cfg-save-error">{delErr}</div>}
                            <p style={{ margin: 0, color: 'var(--cfg-text-secondary)' }}>¿Deseas eliminar este evento? Se eliminarán todos los datos asociados.</p>
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
