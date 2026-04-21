import React, { useState } from 'react';
import QrScanner from '../components/QrScanner';

const QrScannerPage: React.FC = () => {
    const [scannedData, setScannedData] = useState<string | null>(null);

    const handleScan = (data: string | null) => {
        if (data) {
            setScannedData(data);
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Escanear Código QR</h1>
            <p>Apunta tu cámara hacia un código QR</p>
            
            <div style={{ marginBottom: '20px' }}>
                <QrScanner onScan={handleScan} />
            </div>

            {scannedData && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h3>Resultado del escaneo:</h3>
                    <p style={{ wordBreak: 'break-all' }}>{scannedData}</p>
                    <button 
                        onClick={() => setScannedData(null)}
                        style={{ padding: '8px 16px', cursor: 'pointer' }}
                    >
                        Limpiar y reintentar
                    </button>
                </div>
            )}
        </div>
    );
};

export default QrScannerPage;
