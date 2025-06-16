// ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from './utils/auth';

const ProtectedRoute = () => {
    const user = getCurrentUser();
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;