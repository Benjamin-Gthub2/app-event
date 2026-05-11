import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
    onScan: (data: string) => void;
    scanKey: number;
}

const READER_ID = 'qr-reader';

async function safeStop(scanner: Html5Qrcode) {
    try { await scanner.stop(); } catch { /* no estaba corriendo */ }
    try { await scanner.clear(); } catch { /* ignorar */ }
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, scanKey }) => {
    const firedRef = useRef(false);

    useEffect(() => {
        firedRef.current = false;
        let isRunning = false;
        let cancelled = false;

        const container = document.getElementById(READER_ID);
        if (container) container.innerHTML = '';

        const scanner = new Html5Qrcode(READER_ID);

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        const onSuccess = (decodedText: string) => {
            if (firedRef.current) return;
            firedRef.current = true;
            if (navigator.vibrate) navigator.vibrate(150);
            onScan(decodedText);
        };

        const startScanner = async () => {
            const constraints: MediaTrackConstraints[] = [
                { facingMode: { exact: 'environment' } },
                { facingMode: 'environment' },
                { facingMode: 'user' },
            ];
            for (const c of constraints) {
                try {
                    await scanner.start(c, config, onSuccess, () => null);
                    return true;
                } catch {
                    // probar siguiente
                }
            }
            return false;
        };

        startScanner().then((started) => {
            if (!started) return;
            if (cancelled) {
                safeStop(scanner);
            } else {
                isRunning = true;
            }
        });

        return () => {
            cancelled = true;
            if (isRunning) {
                safeStop(scanner);
            }
        };
    }, [scanKey]);

    return (
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <div id={READER_ID} />
        </div>
    );
};

export default QrScanner;
