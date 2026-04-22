import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { registrationService } from '../services/registrationService';
import type { Registration, Pagination } from '../types/registration.types';
import './RegistrationsPage.css';

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

// ── Helpers ────────────────────────────────────────────────────────────────────

function fullName(names: string, surname: string, lastName: string | null) {
    return [names, surname, lastName].filter(Boolean).join(' ');
}

function initials(names: string, surname: string) {
    return `${names[0] ?? ''}${surname[0] ?? ''}`.toUpperCase();
}

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

const PAGE_SIZE = 10;

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

    useEffect(() => {
        fetchData(page);
    }, [fetchData, page]);

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
                    <button className="reg-reload-btn" onClick={() => fetchData(page)} disabled={loading}>
                        <IconRefresh spinning={loading} />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="reg-error">
                    <IconAlert />
                    {error}
                </div>
            )}

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
                                <th>Registrado por</th>
                                <th>Fecha</th>
                                <th>QR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && rows.length === 0 ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <td key={j}>
                                                <span className="reg-skeleton" style={{ width: `${60 + (j * 13) % 60}px` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr className="reg-state-row">
                                    <td colSpan={8}>
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
        </DashboardLayout>
    );
}
