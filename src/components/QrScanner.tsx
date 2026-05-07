import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerProps {
    onScan: (data: string) => void;
    scanKey: number;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, scanKey }) => {
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

        let fired = false;
        scanner.render(
            (decodedText: string) => {
                if (fired) return;
                fired = true;
                if (navigator.vibrate) navigator.vibrate(150);
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
            <div id="reader" />
        </div>
    );
};

export default QrScanner;
