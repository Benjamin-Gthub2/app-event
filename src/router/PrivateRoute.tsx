import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface PrivateRouteProps {
    children: ReactNode;
    viewPath?: string; // path que debe existir en los views del usuario
}

export default function PrivateRoute({ children, viewPath }: PrivateRouteProps) {
    const { isAuthenticated, views } = useAuth();

    if (!isAuthenticated) return <Navigate to="/" replace />;

    // Si hay views cargadas y el path requerido no está entre ellos → sin acceso
    if (viewPath && views.length > 0 && !views.some(v => v.url === viewPath)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
