import React, { useState } from 'react';
import QrScanner from '../components/QrScanner';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import './QrScannerPage.css';

type ParsedResult =
    | { type: 'url'; value: string }
    | { type: 'json'; value: Record<string, unknown> }
    | { type: 'text'; value: string };

function parseQrData(raw: string): ParsedResult {
    try {
        new URL(raw);
        return { type: 'url', value: raw };
    } catch (_) { /* not a URL */ }

    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
            return { type: 'json', value: parsed as Record<string, unknown> };
        }
    } catch (_) { /* not JSON */ }

    return { type: 'text', value: raw };
}

const QrScannerPage: React.FC = () => {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [scanKey, setScanKey] = useState(0);

    const handleScan = (data: string) => setScannedData(data);

    const handleReset = () => {
        setScannedData(null);
        setScanKey(k => k + 1);
    };

    if (scannedData) {
        const parsed = parseQrData(scannedData);

        return (
            <DashboardLayout title="Escáner QR">
                <div className="qr-page qr-page--embedded">
                    <div className="qr-result-card">
                        <div className="qr-result-icon">✓</div>
                        <h2 className="qr-result-title">Código leído</h2>

                        <div className="qr-detail-box">
                            {parsed.type === 'url' && (
                                <>
                                    <p className="qr-label">Enlace detectado</p>
                                    <a href={parsed.value} target="_blank" rel="noopener noreferrer" className="qr-link">
                                        {parsed.value}
                                    </a>
                                </>
                            )}
                            {parsed.type === 'json' && (
                                <>
                                    <p className="qr-label">Datos estructurados</p>
                                    {Object.entries(parsed.value).map(([key, val]) => (
                                        <div key={key} className="qr-row">
                                            <span className="qr-key">{key}</span>
                                            <span className="qr-val">{String(val)}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                            {parsed.type === 'text' && (
                                <>
                                    <p className="qr-label">Contenido</p>
                                    <p className="qr-raw-text">{parsed.value}</p>
                                </>
                            )}
                        </div>

                        <button onClick={handleReset} className="qr-btn-back">
                            ← Escanear otro código
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

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
                            <p className="qr-scanner-subtitle">Apunta la cámara al código</p>
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
