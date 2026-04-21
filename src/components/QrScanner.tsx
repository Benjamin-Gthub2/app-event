import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerProps {
    onScan: (data: string) => void;
    scanKey: number;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, scanKey }) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            'reader',
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
            },
            false,
        );
        scannerRef.current = scanner;

        scanner.render(
            (decodedText: string) => {
                if (navigator.vibrate) {
                    navigator.vibrate(150);
                }
                scanner.clear().catch(() => null);
                onScan(decodedText);
            },
            () => null,
        );

        return () => {
            scanner.clear().catch(() => null);
        };
    }, [scanKey]);

    return (
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <div id="reader" style={{ borderRadius: '12px', overflow: 'hidden' }} />
        </div>
    );
};

export default QrScanner;
