import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Mic, Library, ExternalLink } from 'lucide-react';
import ToolsGrid from '@/components/blocks/Dashboard/tools-grid';

const tools = [
    {
        id: 'podcast-generator',
        title: 'Podcast Generator',
        description: 'Transform any URL into an engaging podcast',
        icon: <Mic className="size-8 text-foreground" />,
        link: '/dashboard/podcast/generate',
        buttonText: 'Create Podcast',
    },
];

export default function Dashboard() {
    const { user } = useAuth();
    const [usage, setUsage] = useState(null);
    const [recentPodcasts, setRecentPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usageRes, podcastsRes] = await Promise.all([
                api.get('/auth/usage'),
                api.get('/podcast/get?limit=3'),
            ]);
            setUsage(usageRes.data.usage);
            setRecentPodcasts(podcastsRes.data.data.podcasts || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const usagePercentage = usage ? (usage.current / usage.limit) * 100 : 0;

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
                <p className="text-muted-foreground">What would you like to create today?</p>
            </div>

            {/* Usage Stats */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Monthly Usage</CardTitle>
                    <CardDescription>
                        {loading ? (
                            <Skeleton className="h-4 w-48" />
                        ) : (
                            `${usage?.current || 0} of ${usage?.limit || 10} podcasts used`
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-2 w-full" />
                    ) : (
                        <Progress value={usagePercentage} className="h-2" />
                    )}
                    {usage && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Resets in {usage.daysUntilReset} days
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Tool Selector */}
            <ToolsGrid tools={tools} />

            {/* Recent Podcasts */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Podcasts</h2>
                    <Link to="/library">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Library className="size-4" />
                            View All
                        </Button>
                    </Link>
                </div>
                {loading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </div>
                ) : recentPodcasts.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <p>No podcasts yet. Create your first one!</p>
                            <Link to="/dashboard/podcast/generate">
                                <Button variant="outline" className="mt-4">
                                    Get Started
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {recentPodcasts.map((podcast) => (
                            <Link key={podcast.id} to={`/dashboard/podcast/${podcast.id}`}>
                                <Card className="hover:border-primary transition-colors cursor-pointer">
                                    <CardContent className="flex items-center justify-between py-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{podcast.blogUrl}</p>
                                            {podcast.status === 'failed' ? (
                                                <Badge variant="destructive" className="mt-1">
                                                    Failed
                                                </Badge>
                                            ) : podcast.status === 'completed' ? (
                                                <Badge className="mt-1 bg-green-500 hover:bg-green-600">
                                                    Completed
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="mt-1 capitalize">
                                                    {podcast.status?.replace(/_/g, ' ')}
                                                </Badge>
                                            )}
                                        </div>
                                        <ExternalLink className="size-4 text-muted-foreground flex-shrink-0" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
