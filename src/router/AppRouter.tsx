import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard.tsx";
import QrScannerPage from "../pages/QrScannerPage";
import RegistrationsPage from "../pages/RegistrationsPage";
import PrivateRoute from "./PrivateRoute";

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
                        <PrivateRoute>
                            <QrScannerPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/asistentes"
                    element={
                        <PrivateRoute>
                            <RegistrationsPage />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
