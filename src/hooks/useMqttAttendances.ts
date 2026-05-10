import { useEffect, useRef, useState } from 'react';
import mqtt from 'mqtt';

const MQTT_URL = 'wss://mqtt.macsalud.onscp.com:8084/mqtt';

export function useMqttAttendances(onUpdate: () => void) {
    const [connected, setConnected] = useState(false);
    const onUpdateRef = useRef(onUpdate);

    useEffect(() => {
        onUpdateRef.current = onUpdate;
    });

    useEffect(() => {
        const tenantId = localStorage.getItem('x_tenant_id');
        if (!tenantId) return;

        const topic = `/event/attendances/updates/${tenantId}`;

        const client = mqtt.connect(MQTT_URL, {
            clientId: `app_event_${Math.random().toString(16).slice(2)}`,
            clean: true,
            reconnectPeriod: 5000,
        });

        client.on('connect', () => {
            setConnected(true);
            client.subscribe(topic);
        });

        client.on('message', () => {
            onUpdateRef.current();
        });

        client.on('close', () => setConnected(false));
        client.on('error', () => setConnected(false));

        return () => {
            client.end(true);
        };
    }, []);

    return { connected };
}
