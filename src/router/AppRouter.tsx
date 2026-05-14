import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import QrScannerPage from '../pages/QrScannerPage';
import RegistrationsPage from '../pages/RegistrationsPage';
import AccessControlPage from '../pages/AccessControlPage';
import TalleresPage from '../pages/TalleresPage';
import ConfiguracionPage from '../pages/ConfiguracionPage';
import PrivateRoute from './PrivateRoute';

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/qr-scanner"
                    element={
                        <PrivateRoute viewPath="/qr-scanner">
                            <QrScannerPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/asistentes"
                    element={
                        <PrivateRoute viewPath="/asistentes">
                            <RegistrationsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/accesos"
                    element={
                        <PrivateRoute viewPath="/accesos">
                            <AccessControlPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/talleres"
                    element={
                        <PrivateRoute viewPath="/talleres">
                            <TalleresPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/configuracion"
                    element={
                        <PrivateRoute viewPath="/configuracion">
                            <ConfiguracionPage />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
