import { useState } from 'react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import PersonasTab from './configuracion/PersonasTab';
import TalleresTab from './configuracion/TalleresTab';
import EventosTab from './configuracion/EventosTab';
import './ConfiguracionPage.css';

type Tab = 'personas' | 'talleres' | 'eventos';

export default function ConfiguracionPage() {
    const [tab, setTab] = useState<Tab>('personas');

    return (
        <DashboardLayout title="Configuración">
            <div className="cfg-page">
                <div className="cfg-tabs">
                    <button className={`cfg-tab ${tab === 'personas' ? 'cfg-tab--active' : ''}`} onClick={() => setTab('personas')}>
                        Personas
                    </button>
                    <button className={`cfg-tab ${tab === 'talleres' ? 'cfg-tab--active' : ''}`} onClick={() => setTab('talleres')}>
                        Talleres
                    </button>
                    <button className={`cfg-tab ${tab === 'eventos' ? 'cfg-tab--active' : ''}`} onClick={() => setTab('eventos')}>
                        Eventos
                    </button>
                </div>

                {tab === 'personas' && <PersonasTab />}
                {tab === 'talleres' && <TalleresTab />}
                {tab === 'eventos'  && <EventosTab />}
            </div>
        </DashboardLayout>
    );
}
