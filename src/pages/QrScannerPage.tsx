import React, { useState } from 'react';
import QrScanner from '../components/QrScanner';

type ParsedResult =
    | { type: 'url'; value: string }
    | { type: 'json'; value: Record<string, unknown> }
    | { type: 'text'; value: string };

function parseQrData(raw: string): ParsedResult {
    try {
        new URL(raw);
        return { type: 'url', value: raw };
    } catch {}

    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
            return { type: 'json', value: parsed as Record<string, unknown> };
        }
    } catch {}

    return { type: 'text', value: raw };
}

const QrScannerPage: React.FC = () => {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [scanKey, setScanKey] = useState(0);

    const handleScan = (data: string) => {
        setScannedData(data);
    };

    const handleReset = () => {
        setScannedData(null);
        setScanKey(k => k + 1);
    };

    if (scannedData) {
        const parsed = parseQrData(scannedData);

        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={styles.iconWrapper}>
                        <span style={styles.icon}>✓</span>
                    </div>

                    <h2 style={styles.title}>Código leído</h2>

                    <div style={styles.detailBox}>
                        {parsed.type === 'url' && (
                            <>
                                <p style={styles.label}>Enlace detectado</p>
                                <a
                                    href={parsed.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={styles.link}
                                >
                                    {parsed.value}
                                </a>
                            </>
                        )}

                        {parsed.type === 'json' && (
                            <>
                                <p style={styles.label}>Datos estructurados</p>
                                {Object.entries(parsed.value).map(([key, val]) => (
                                    <div key={key} style={styles.row}>
                                        <span style={styles.key}>{key}</span>
                                        <span style={styles.val}>{String(val)}</span>
                                    </div>
                                ))}
                            </>
                        )}

                        {parsed.type === 'text' && (
                            <>
                                <p style={styles.label}>Contenido</p>
                                <p style={styles.rawText}>{parsed.value}</p>
                            </>
                        )}
                    </div>

                    <button onClick={handleReset} style={styles.button}>
                        ← Escanear otro código
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <h1 style={{ marginBottom: '8px' }}>Escanear Código QR</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
                Apunta tu cámara hacia un código QR
            </p>
            <QrScanner onScan={handleScan} scanKey={scanKey} />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        padding: '24px 16px',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        background: '#fff',
        borderRadius: '16px',
        padding: '32px 24px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
    },
    iconWrapper: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: '#22c55e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        color: '#fff',
        fontSize: '32px',
        fontWeight: 'bold',
    },
    title: {
        margin: 0,
        fontSize: '22px',
        fontWeight: 700,
    },
    detailBox: {
        width: '100%',
        background: '#f4f4f5',
        borderRadius: '10px',
        padding: '16px',
        textAlign: 'left',
    },
    label: {
        margin: '0 0 10px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#888',
        letterSpacing: '0.05em',
    },
    link: {
        color: '#2563eb',
        wordBreak: 'break-all',
        fontSize: '14px',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        borderBottom: '1px solid #e4e4e7',
        fontSize: '14px',
    },
    key: {
        fontWeight: 600,
        color: '#444',
        marginRight: '12px',
    },
    val: {
        color: '#111',
        wordBreak: 'break-all',
        textAlign: 'right',
    },
    rawText: {
        margin: 0,
        fontSize: '14px',
        wordBreak: 'break-all',
        color: '#111',
        lineHeight: '1.6',
    },
    button: {
        marginTop: '8px',
        padding: '12px 24px',
        borderRadius: '10px',
        border: 'none',
        background: '#111',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        width: '100%',
    },
};

export default QrScannerPage;
