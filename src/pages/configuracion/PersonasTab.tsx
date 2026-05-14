import { useState, useEffect, useCallback } from 'react';
import { peopleService } from '../../services/peopleService';
import type { Person } from '../../types/people.types';
import '../ConfiguracionPage.css';

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

function fullName(n: string, s: string, l: string | null) {
    return [n, s, l].filter(Boolean).join(' ');
}
function initials(n: string, s: string) {
    return `${n[0] ?? ''}${s[0] ?? ''}`.toUpperCase();
}

interface PForm {
    type_document_id: string; document: string; names: string;
    surname: string; last_name: string; phone: string;
    email: string; gender: string; enable: boolean;
}
const EMPTY: PForm = {
    type_document_id: '', document: '', names: '', surname: '',
    last_name: '', phone: '', email: '', gender: '', enable: true,
};
export default function PersonasTab() {
    const [rows, setRows]       = useState<Person[]>([]);
    const [page, setPage]       = useState(1);
    const [totalPages, setTP]   = useState(1);
    const [total, setTotal]     = useState(0);
    const [pageSize, setPageSize] = useState(50);
    const [searchInput, setSI]  = useState('');
    const [activeQ, setAQ]      = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    const [modal, setModal]         = useState<'create' | 'edit' | null>(null);
    const [editRow, setEditRow]     = useState<Person | null>(null);
    const [deleteId, setDeleteId]   = useState<string | null>(null);
    const [form, setForm]           = useState<PForm>(EMPTY);
    const [saving, setSaving]       = useState(false);
    const [saveErr, setSaveErr]     = useState<string | null>(null);
    const [delErr, setDelErr]       = useState<string | null>(null);

    const sf = <K extends keyof PForm>(k: K, v: PForm[K]) => setForm(f => ({ ...f, [k]: v }));

    const fetch = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await peopleService.getPeople({ page, size_page: pageSize, searchvalue: activeQ || undefined });
            setRows(res.data ?? []);
            const tot = res.pagination.total;
            setTotal(tot);
            setTP(Math.max(res.pagination.last_page, Math.ceil(tot / pageSize), 1));
        } catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar.'); }
        finally { setLoading(false); }
    }, [page, activeQ, pageSize]);

    useEffect(() => { fetch(); }, [fetch]);

    const doSearch = () => { setPage(1); setAQ(searchInput); };
    const clearSearch = () => { setSI(''); setPage(1); setAQ(''); };

    const openCreate = () => { setForm(EMPTY); setSaveErr(null); setModal('create'); };
    const openEdit   = (p: Person) => {
        setEditRow(p);
        setForm({ type_document_id: p.document_type.id, document: p.document, names: p.names, surname: p.surname, last_name: p.last_name ?? '', phone: p.phone ?? '', email: p.email ?? '', gender: p.gender ?? '', enable: p.enable });
        setSaveErr(null); setModal('edit');
    };
    const closeModal = () => { setModal(null); setEditRow(null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setSaveErr(null);
        try {
            const body = { type_document_id: form.type_document_id, document: form.document, names: form.names, surname: form.surname, last_name: form.last_name || undefined, phone: form.phone || undefined, email: form.email || undefined, gender: form.gender || undefined, enable: form.enable };
            if (modal === 'create') await peopleService.createPerson(body);
            else if (editRow) await peopleService.updatePerson(editRow.id, body);
            closeModal(); fetch();
        } catch (e) { setSaveErr(e instanceof Error ? e.message : 'Error al guardar.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return; setSaving(true); setDelErr(null);
        try {
            await peopleService.deletePerson(deleteId);
            setDeleteId(null);
            if (rows.length === 1 && page > 1) setPage(p => p - 1); else fetch();
        } catch (e) { setDelErr(e instanceof Error ? e.message : 'Error al eliminar.'); }
        finally { setSaving(false); }
    };

    return (
        <div>
            <div className="cfg-toolbar">
                <div className="cfg-toolbar-left">
                    <input className="cfg-search-input" placeholder="Buscar por nombre..." value={searchInput} onChange={e => setSI(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} />
                    <button className="cfg-btn-ghost" onClick={doSearch}>Buscar</button>
                    {activeQ && <button className="cfg-btn-ghost" onClick={clearSearch}>× Limpiar</button>}
                </div>
                <button className="cfg-btn-success" onClick={openCreate}><IconPlus /> Agregar Persona</button>
            </div>

            {error && <div className="cfg-error">{error}</div>}

            <div className="cfg-card">
                <div className="cfg-card-head">
                    <span className="cfg-card-title">Personas</span>
                    <span className="cfg-card-count">{total} registro{total !== 1 ? 's' : ''}</span>
                </div>
                <div className="cfg-table-wrap">
                    <table className="cfg-table">
                        <thead><tr><th>#</th><th>Nombre</th><th>Documento</th><th>Contacto</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>{[100, 160, 90, 120, 60, 60].map((w, j) => <td key={j}><span className="cfg-skeleton" style={{ width: w }} /></td>)}</tr>
                            )) : rows.length === 0 ? (
                                <tr className="cfg-state-row"><td colSpan={6}>No hay personas registradas.</td></tr>
                            ) : rows.map((p, idx) => (
                                <tr key={p.id}>
                                    <td><span className="cfg-num">{(page - 1) * pageSize + idx + 1}</span></td>
                                    <td>
                                        <div className="cfg-cell-main">
                                            <div className="cfg-avatar">{initials(p.names, p.surname)}</div>
                                            <div>
                                                <div className="cfg-cell-name">{fullName(p.names, p.surname, p.last_name)}</div>
                                                {p.gender && <div className="cfg-cell-sub">{p.gender === 'M' ? 'Masculino' : 'Femenino'}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cfg-cell-name">{p.document_type.abbreviated_description}</div>
                                        <div className="cfg-cell-sub">{p.document}</div>
                                    </td>
                                    <td>
                                        <div className="cfg-cell-sub">{p.phone ?? '—'}</div>
                                        <div className="cfg-cell-sub">{p.email ?? '—'}</div>
                                    </td>
                                    <td>{p.enable ? <span className="cfg-badge-enable">Activo</span> : <span className="cfg-badge-disable">Inactivo</span>}</td>
                                    <td>
                                        <div className="cfg-actions">
                                            <button className="cfg-btn-icon cfg-btn-icon--edit" title="Editar" onClick={() => openEdit(p)}><IconEdit /></button>
                                            <button className="cfg-btn-icon cfg-btn-icon--delete" title="Eliminar" onClick={() => { setDeleteId(p.id); setDelErr(null); }}><IconTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="cfg-pagination">
                    <div className="cfg-pagination-size">
                        <span>Filas:</span>
                        <select className="cfg-page-size-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={1000}>1000</option>
                        </select>
                    </div>
                    <span className="cfg-pagination-info">Página {page} de {totalPages} · {total} total</span>
                    <div className="cfg-pagination-btns">
                        <button className="cfg-page-btn" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>‹</button>
                        <span className="cfg-page-btn cfg-page-btn--active">{page}</span>
                        <button className="cfg-page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>›</button>
                    </div>
                </div>
            </div>

            {/* Create / Edit modal */}
            {modal && (
                <div className="cfg-overlay">
                    <div className="cfg-modal">
                        <div className="cfg-modal-head">
                            <h3>{modal === 'create' ? 'Agregar Persona' : 'Editar Persona'}</h3>
                            <button className="cfg-modal-close" onClick={closeModal}><IconClose /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="cfg-modal-body">
                                {saveErr && <div className="cfg-save-error">{saveErr}</div>}
                                <div className="cfg-form-grid">
                                    <div className="cfg-form-group">
                                        <label>Tipo Documento <span className="cfg-req">*</span></label>
                                        <select className="cfg-form-select" value={form.type_document_id} onChange={e => sf('type_document_id', e.target.value)} required>
                                            <option value="">Seleccionar...</option>
                                            {DOCUMENT_TYPES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>N° Documento <span className="cfg-req">*</span></label>
                                        <input className="cfg-form-input" value={form.document} onChange={e => sf('document', e.target.value)} required placeholder="Ej: 12345678" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Nombres <span className="cfg-req">*</span></label>
                                        <input className="cfg-form-input" value={form.names} onChange={e => sf('names', e.target.value)} required placeholder="Nombres" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Ap. Paterno <span className="cfg-req">*</span></label>
                                        <input className="cfg-form-input" value={form.surname} onChange={e => sf('surname', e.target.value)} required placeholder="Apellido paterno" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Ap. Materno</label>
                                        <input className="cfg-form-input" value={form.last_name} onChange={e => sf('last_name', e.target.value)} placeholder="Apellido materno" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Género</label>
                                        <select className="cfg-form-select" value={form.gender} onChange={e => sf('gender', e.target.value)}>
                                            <option value="">Sin especificar</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                        </select>
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Teléfono</label>
                                        <input className="cfg-form-input" type="tel" value={form.phone} onChange={e => sf('phone', e.target.value)} placeholder="+51 999 999 999" />
                                    </div>
                                    <div className="cfg-form-group">
                                        <label>Email</label>
                                        <input className="cfg-form-input" type="email" value={form.email} onChange={e => sf('email', e.target.value)} placeholder="email@ejemplo.com" />
                                    </div>
                                    <div className="cfg-form-group cfg-form-group--full">
                                        <div className="cfg-form-toggle">
                                            <input type="checkbox" id="p-enable" className="cfg-toggle-input" checked={form.enable} onChange={e => sf('enable', e.target.checked)} />
                                            <label htmlFor="p-enable" className="cfg-toggle-label">Habilitar</label>
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
                <div className="cfg-overlay">
                    <div className="cfg-modal cfg-modal--sm">
                        <div className="cfg-modal-head">
                            <h3>Eliminar Persona</h3>
                            <button className="cfg-modal-close" onClick={() => setDeleteId(null)}><IconClose /></button>
                        </div>
                        <div className="cfg-modal-body">
                            {delErr && <div className="cfg-save-error">{delErr}</div>}
                            <p style={{ margin: 0, color: 'var(--cfg-text-secondary)' }}>
                                ¿Deseas eliminar esta persona? Esta acción no se puede deshacer.
                            </p>
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
