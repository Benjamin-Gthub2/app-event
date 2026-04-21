import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerProps {
    onScan: (data: string | null) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan }) => {
    useEffect(() => {
        // Configuración del scanner
        const scanner = new Html5QrcodeScanner(
            'reader', // ID del elemento DOM
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
            },
            /* verbose= */ false
        );

        const onScanSuccess = (decodedText: string) => {
            onScan(decodedText);
            // Opcional: Detener el scanner tras el primer éxito
            // scanner.clear();
        };

        const onScanFailure = (error: any) => {
            // Errores de escaneo (cuando no encuentra un QR en el frame actual)
            // Se ignoran para no saturar logs
        };

        // Iniciar el renderizado
        scanner.render(onScanSuccess, onScanFailure);

        // Limpieza al desmontar el componente
        return () => {
            scanner.clear().catch(error => console.error("Error al limpiar el scanner", error));
        };
    }, []);

    return (
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            {/* El ID 'reader' es crucial para que la librería encuentre el div */}
            <div id="reader" style={{ borderRadius: '12px', overflow: 'hidden', border: 'none' }}></div>
        </div>
    );
};

export default QrScanner;
