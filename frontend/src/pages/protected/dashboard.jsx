import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Mic, Library, ExternalLink, Youtube, Globe, Coins, Volume2, FileText, Type, Layers, BookOpen, ClipboardList, NotebookPen, ChartBar, Sparkles, FileQuestion, StickyNote, Brain } from 'lucide-react';
import ToolsGrid from '@/components/blocks/Dashboard/tools-grid';
import { useCreditPricing } from '@/hooks/useCreditPricing';
import { truncateUrl } from '@/lib/utils';

const tools = [
    {
        id: 'podcast-generator',
        title: 'Podcast Generator',
        description: 'Transform any URL into an engaging podcast',
        credits: 3,
        icon: <Mic className="size-8 text-foreground" />,
        link: '/dashboard/podcast/generate',
        buttonText: 'Create Podcast',
    },
    {
        id: 'gossip-generator',
        title: 'Gossip Generator',
        description: 'Turn articles into Gen Z-style audio convos with Maya & Jay',
        credits: 3,
        icon: <Sparkles className="size-8 text-foreground" />,
        link: '/dashboard/gossip/generate',
        buttonText: 'Spill the Tea',
    },
    {
        id: 'notes-generator',
        title: 'AI Notes Generator',
        description: 'Generate structured handwritten-style notes from any content',
        credits: 2,
        icon: <NotebookPen className="size-8 text-foreground" />,
        link: '/dashboard/notes/generate',
        buttonText: 'Generate Notes',
    },
];

export default function Dashboard() {
    const { user } = useAuth();
    const { pricing } = useCreditPricing();
    const [usage, setUsage] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usageRes, activityRes] = await Promise.all([
                api.get('/auth/usage'),
                api.get('/summarize/activity?limit=10'),
            ]);
            setUsage(usageRes.data.usage);
            setRecentActivity(activityRes.data.data.activity || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const usagePercentage = usage ? (usage.current / usage.limit) * 100 : 0;

    const getActivityIcon = (item) => {
        switch (item.activityType) {
            case 'podcast':
                return <Mic className="size-4 text-purple-500" />;
            case 'gossip':
                return <Sparkles className="size-4 text-pink-500" />;
            case 'quiz':
                return <FileQuestion className="size-4 text-indigo-500" />;
            case 'note':
                return <StickyNote className="size-4 text-amber-500" />;
            case 'visualization':
                return <ChartBar className="size-4 text-cyan-500" />;
            case 'deepExplain':
                return <Brain className="size-4 text-emerald-500" />;
            case 'summary':
            default:
                if (item.type === 'youtube') {
                    return <Youtube className="size-4 text-red-500" />;
                } else if (item.type === 'pdf') {
                    return <FileText className="size-4 text-orange-500" />;
                } else if (item.type === 'text') {
                    return <Type className="size-4 text-gray-500" />;
                }
                return <Globe className="size-4 text-blue-500" />;
        }
    };

    const getActivityBadge = (item) => {
        switch (item.activityType) {
            case 'podcast':
                if (item.status === 'failed') {
                    return <Badge variant="destructive" className="gap-1"><Mic className="size-3" />Failed</Badge>;
                } else if (item.status === 'completed') {
                    return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><Mic className="size-3" />Completed</Badge>;
                }
                return <Badge variant="secondary" className="capitalize gap-1"><Mic className="size-3" />{item.status?.replace(/_/g, ' ')}</Badge>;
            case 'gossip':
                if (item.status === 'failed') {
                    return <Badge variant="destructive" className="gap-1"><Sparkles className="size-3" />Failed</Badge>;
                } else if (item.status === 'completed') {
                    return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><Sparkles className="size-3" />Completed</Badge>;
                }
                return <Badge variant="secondary" className="capitalize gap-1"><Sparkles className="size-3" />{item.status?.replace(/_/g, ' ')}</Badge>;
            case 'quiz':
                return <Badge className="bg-indigo-500 hover:bg-indigo-600 gap-1"><FileQuestion className="size-3" />Quiz</Badge>;
            case 'note':
                return <Badge className="bg-amber-500 hover:bg-amber-600 gap-1"><StickyNote className="size-3" />Notes</Badge>;
            case 'visualization':
                return <Badge className="bg-cyan-500 hover:bg-cyan-600 gap-1"><ChartBar className="size-3" />Visual</Badge>;
            case 'deepExplain':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1"><Brain className="size-3" />Explain</Badge>;
            case 'summary':
            default:
                if (item.audioStatus === 'failed') {
                    return <Badge variant="destructive" className="gap-1"><Volume2 className="size-3" />Failed</Badge>;
                }
                const hasAudio = item.audioStatus === 'completed';
                const Icon = hasAudio ? Volume2 : (item.type === 'youtube' ? Youtube : Globe);
                return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><Icon className="size-3" />Completed</Badge>;
        }
    };

    const getActivityLink = (item) => {
        switch (item.activityType) {
            case 'podcast':
                return `/dashboard/podcast/${item.id}`;
            case 'gossip':
                return `/dashboard/gossip/${item.id}`;
            case 'quiz':
                return `/dashboard/quiz/${item.id}`;
            case 'note':
                return `/dashboard/notes/${item.id}`;
            case 'visualization':
                return `/dashboard/visualizer/${item.id}`;
            case 'deepExplain':
                return `/dashboard/deep-explain/${item.id}`;
            case 'summary':
            default:
                return `/dashboard/summary/${item.id}`;
        }
    };

    const getActivityUrl = (item) => {
        // Tools with URLs
        if (item.blogUrl || item.sourceUrl) {
            return truncateUrl(item.blogUrl || item.sourceUrl);
        }
        // Tools with title/topic fields
        return item.title || item.topic || 'Content';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
                <p className="text-muted-foreground">What would you like to create today?</p>
            </div>

            {/* Usage Stats */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Monthly Credits</CardTitle>
                    <CardDescription>
                        {loading ? (
                            <Skeleton className="h-4 w-48" />
                        ) : (
                            `${usage?.current || 0} of ${usage?.limit || 10} credits used`
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
                            Resets in {usage.daysUntilReset} days • Podcast: {pricing.podcast} credits • Summary: {pricing.youtubeSummary} credits
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Tool Selector */}
            <ToolsGrid tools={tools} />

            {/* Recent Activity */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Activity</h2>
                    <Link to="/dashboard/library">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Library className="size-4" />
                            View All
                        </Button>
                    </Link>
                </div>
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : recentActivity.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <p>No activity yet. Create your first content!</p>
                            <Link to="/dashboard/podcast/generate">
                                <Button variant="outline" className="mt-4">
                                    Get Started
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                    {/* Mobile: card list */}
                    <div className="space-y-3 md:hidden">
                        {recentActivity.map((item) => (
                            <Link
                                key={`m-${item.activityType || 'summary'}-${item.id}`}
                                to={getActivityLink(item)}
                                className="block">
                                <Card className="hover:border-primary transition-colors">
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5 shrink-0">{getActivityIcon(item)}</span>
                                            <span className="font-medium text-sm wrap-break-word line-clamp-2 flex-1">
                                                {getActivityUrl(item)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            {getActivityBadge(item)}
                                            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                                <Coins className="size-3" />
                                                {item.credits ?? (item.activityType === 'summary'
                                                    ? (pricing.youtubeSummary + (item.audioStatus === 'completed' ? pricing.audioGeneration : 0))
                                                    : (item.activityType === 'podcast' || item.activityType === 'gossip' ? 3 : 2))
                                                }
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop: table */}
                    <div className="hidden md:block border border-border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Credits</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-24">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivity.map((item) => (
                                    <TableRow key={`${item.activityType || 'summary'}-${item.id}`}>
                                        <TableCell className="font-medium max-w-md">
                                            {item.blogUrl || item.sourceUrl ? (
                                                <a
                                                    href={item.blogUrl || item.sourceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline inline-flex items-center gap-2"
                                                >
                                                    {getActivityIcon(item)}
                                                    <span className="truncate">{getActivityUrl(item)}</span>
                                                    <ExternalLink className="size-3 shrink-0" />
                                                </a>
                                            ) : (
                                                <span className="inline-flex items-center gap-2">
                                                    {getActivityIcon(item)}
                                                    <span className="truncate">{getActivityUrl(item)}</span>
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{getActivityBadge(item)}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-1 text-amber-600">
                                                <Coins className="size-3" />
                                                {item.credits ?? (item.activityType === 'summary' 
                                                    ? (pricing.youtubeSummary + (item.audioStatus === 'completed' ? pricing.audioGeneration : 0))
                                                    : (item.activityType === 'podcast' || item.activityType === 'gossip' ? 3 : 2))
                                                }
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                                        <TableCell>
                                            <Link to={getActivityLink(item)}>
                                                <Button variant="outline" size="sm">View</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
}
