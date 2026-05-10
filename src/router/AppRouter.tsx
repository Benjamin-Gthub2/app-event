import {BrowserRouter, Routes, Route} from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard.tsx";
import QrScannerPage from "../pages/QrScannerPage";
import RegistrationsPage from "../pages/RegistrationsPage";
import AccessControlPage from "../pages/AccessControlPage";
import TalleresPage from "../pages/TalleresPage";
import ConfiguracionPage from "../pages/ConfiguracionPage";
import PrivateRoute from "./PrivateRoute";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/qr-scanner"
                    element={
                        <PrivateRoute>
                            <QrScannerPage/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/asistentes"
                    element={
                        <PrivateRoute>
                            <RegistrationsPage/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/accesos"
                    element={
                        <PrivateRoute>
                            <AccessControlPage/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/talleres"
                    element={
                        <PrivateRoute>
                            <TalleresPage/>
                        </PrivateRoute>
                    }/>
                <Route
                    path="/configuracion"
                    element={
                        <PrivateRoute>
                            <ConfiguracionPage/>
                        </PrivateRoute>
                    }/>
            </Routes>
        </BrowserRouter>
    );
}
