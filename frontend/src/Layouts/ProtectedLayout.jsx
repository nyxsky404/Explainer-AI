import { Outlet, Navigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSidebar } from '@/components/blocks/Dashboard/sidebar/app-sidebar';
import MobileHeader from '@/components/blocks/Dashboard/mobile-header';

export default function ProtectedLayout() {
    const { isAuthenticated, loading } = useAuth();

    // Show skeleton while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Skeleton className="h-8 w-32" />
            </div>
        );
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <SidebarProvider>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <DashboardSidebar />
            <SidebarInset>
                <MobileHeader />
                <main id="main-content" className="flex-1 overflow-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
