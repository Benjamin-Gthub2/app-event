import React, { useState } from 'react';
import QrScanner from '../components/QrScanner';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { registrationService } from '../services/registrationService';
import type { Registration } from '../types/registration.types';
import './QrScannerPage.css';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fullName(names: string, surname: string, lastName: string | null) {
    return [names, surname, lastName].filter(Boolean).join(' ');
}

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

// ── Types ──────────────────────────────────────────────────────────────────────

type ScanState =
    | { status: 'idle' }
    | { status: 'loading'; id: string }
    | { status: 'found'; registration: Registration }
    | { status: 'notfound'; id: string }
    | { status: 'error'; message: string };

// ── Component ──────────────────────────────────────────────────────────────────

const QrScannerPage: React.FC = () => {
    const [scanKey, setScanKey] = useState(0);
    const [state, setState] = useState<ScanState>({ status: 'idle' });

    const handleScan = async (id: string) => {
        setState({ status: 'loading', id });
        try {
            const registration = await registrationService.getRegistrationById(id);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            setState({ status: 'found', registration });
        } catch (e) {
            const msg = e instanceof Error ? e.message : '';
            if (msg.includes('404') || msg.includes('400')) {
                if (navigator.vibrate) navigator.vibrate([300]);
                setState({ status: 'notfound', id });
            } else {
                setState({ status: 'error', message: msg || 'Error al consultar el registro.' });
            }
        }
    };

    const handleReset = () => {
        setState({ status: 'idle' });
        setScanKey(k => k + 1);
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
        const { registration: r } = state;
        const b = r.beneficiary;
        const s = r.session;

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
                            <p className="qr-label">Taller / Sesión</p>
                            <div className="qr-row">
                                <span className="qr-key">Taller</span>
                                <span className="qr-val">{s.work_shop.name}</span>
                            </div>
                            <div className="qr-row">
                                <span className="qr-key">Inicio</span>
                                <span className="qr-val">{formatDate(s.start_date)}</span>
                            </div>
                            <div className="qr-row">
                                <span className="qr-key">Fin</span>
                                <span className="qr-val">{formatDate(s.end_date)}</span>
                            </div>
                        </div>

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
                            ← Escanear otro código
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

    // ── Idle / scanner ───────────────────────────────────────────────────────

    return (
        <DashboardLayout title="Escáner QR">
            <div className="qr-page qr-page--embedded">
                <div className="qr-scanner-card">
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
                            <h1 className="qr-scanner-title">Escanear QR</h1>
                            <p className="qr-scanner-subtitle">Apunta la cámara al código de inscripción</p>
                        </div>
                    </div>

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
                </div>
            </div>
        </DashboardLayout>
    );
};

export default QrScannerPage;
