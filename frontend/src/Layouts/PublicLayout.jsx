import { Outlet, Navigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';

export default function PublicLayout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-background">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <div id="main-content">
                <Outlet />
            </div>
        </div>
    );
}