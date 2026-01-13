import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground mt-1">
                            Welcome back{user?.name ? `, ${user.name}` : ''}!
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-6 bg-card rounded-lg border">
                        <h2 className="font-semibold mb-2">Your Profile</h2>
                        <p className="text-sm text-muted-foreground">
                            Email: {user?.email || 'Not available'}
                        </p>
                    </div>

                    <div className="p-6 bg-card rounded-lg border">
                        <h2 className="font-semibold mb-2">Quick Stats</h2>
                        <p className="text-sm text-muted-foreground">
                            Coming soon...
                        </p>
                    </div>

                    <div className="p-6 bg-card rounded-lg border">
                        <h2 className="font-semibold mb-2">Recent Activity</h2>
                        <p className="text-sm text-muted-foreground">
                            No recent activity
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
