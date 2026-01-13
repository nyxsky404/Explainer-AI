import { Outlet, Navigate, NavLink, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, Mic, Library, User, LogOut, ChevronUp } from 'lucide-react';

const navItems = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Generate Podcast',
        url: '/dashboard/podcast/generate',
        icon: Mic,
    },
    {
        title: 'Library',
        url: '/library',
        icon: Library,
    },
];

export default function ProtectedLayout() {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const navigate = useNavigate();

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

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar collapsible="icon">
                    <SidebarHeader className="border-b border-border">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild>
                                    <NavLink to="/dashboard">
                                        <div className="flex aspect-square size-8 items-center justify-center bg-primary text-primary-foreground">
                                            <Mic className="size-4" />
                                        </div>
                                        <div className="flex flex-col gap-0.5 leading-none">
                                            <span className="font-semibold">Explainer</span>
                                            <span className="text-xs text-muted-foreground">Podcast Generator</span>
                                        </div>
                                    </NavLink>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild tooltip={item.title}>
                                                <NavLink
                                                    to={item.url}
                                                    className={({ isActive }) =>
                                                        isActive ? 'bg-accent text-accent-foreground' : ''
                                                    }
                                                >
                                                    <item.icon className="size-4" />
                                                    <span>{item.title}</span>
                                                </NavLink>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="border-t border-border">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton
                                            size="lg"
                                            className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                                        >
                                            <Avatar className="size-8">
                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                    {getInitials(user?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col gap-0.5 leading-none text-left">
                                                <span className="font-medium truncate">{user?.name}</span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {user?.email}
                                                </span>
                                            </div>
                                            <ChevronUp className="ml-auto size-4" />
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                                        side="top"
                                        align="start"
                                        sideOffset={4}
                                    >
                                        <DropdownMenuItem asChild>
                                            <NavLink to="/profile" className="flex items-center gap-2">
                                                <User className="size-4" />
                                                Profile
                                            </NavLink>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <LogOut className="size-4 mr-2" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 overflow-auto">
                    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background px-4">
                        <SidebarTrigger />
                    </header>
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
