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
import { Mic, Library, ExternalLink, Youtube, Globe, Coins, Volume2, FileText, Type, Layers, BookOpen, ClipboardList, NotebookPen, BarChart2 } from 'lucide-react';
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
        id: 'deep-explain',
        title: 'AI Deep Explain',
        description: 'Get expert explanations for any topic or concept',
        credits: 2,
        icon: <BookOpen className="size-8 text-foreground" />,
        link: '/dashboard/deep-explain',
        buttonText: 'Explain Topic',
    },
    {
        id: 'quiz-generator',
        title: 'AI Quiz Generator',
        description: 'Generate quizzes from any content to test your knowledge',
        credits: 2,
        icon: <ClipboardList className="size-8 text-foreground" />,
        link: '/dashboard/quiz/generate',
        buttonText: 'Generate Quiz',
    },
    {
        id: 'youtube-summarizer',
        title: 'YouTube Summarizer',
        description: 'Get key points from any YouTube video',
        credits: 2,
        icon: <Youtube className="size-8 text-foreground" />,
        link: '/dashboard/youtube-summarize',
        buttonText: 'Summarize Video',
    },
    {
        id: 'web-summarizer',
        title: 'Web Page Summarizer',
        description: 'Extract and summarize content from any webpage',
        credits: 2,
        icon: <Globe className="size-8 text-foreground" />,
        link: '/dashboard/web-summarize',
        buttonText: 'Summarize Page',
    },
    {
        id: 'pdf-summarizer',
        title: 'PDF Summarizer',
        description: 'Upload and summarize any PDF document',
        credits: 2,
        icon: <FileText className="size-8 text-foreground" />,
        link: '/dashboard/pdf-summarize',
        buttonText: 'Summarize PDF',
    },
    {
        id: 'text-summarizer',
        title: 'Text Summarizer',
        description: 'Paste any text to extract key insights',
        credits: 2,
        icon: <Type className="size-8 text-foreground" />,
        link: '/dashboard/text-summarize',
        buttonText: 'Summarize Text',
    },
    {
        id: 'batch-summarizer',
        title: 'Batch URLs',
        description: 'Summarize up to 5 URLs at once',
        credits: '2/URL',
        icon: <Layers className="size-8 text-foreground" />,
        link: '/dashboard/batch-summarize',
        buttonText: 'Batch Process',
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
    {
        id: 'topic-visualizer',
        title: 'Topic Visualizer',
        description: 'Turn any concept into diagrams or AI illustrations',
        credits: '1–5',
        icon: <BarChart2 className="size-8 text-foreground" />,
        link: '/dashboard/visualizer/generate',
        buttonText: 'Visualize Topic',
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
        if (item.activityType === 'podcast') {
            return <Mic className="size-4 text-purple-500" />;
        } else if (item.type === 'youtube') {
            return <Youtube className="size-4 text-red-500" />;
        } else {
            return <Globe className="size-4 text-blue-500" />;
        }
    };

    const getActivityBadge = (item) => {
        if (item.activityType === 'podcast') {
            if (item.status === 'failed') {
                return <Badge variant="destructive" className="gap-1"><Mic className="size-3" />Failed</Badge>;
            } else if (item.status === 'completed') {
                return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><Mic className="size-3" />Completed</Badge>;
            } else {
                return <Badge variant="secondary" className="capitalize gap-1"><Mic className="size-3" />{item.status?.replace(/_/g, ' ')}</Badge>;
            }
        } else {
            // Summary badge: red speaker if audio failed, green speaker if audio completed, green YT/Globe if no audio
            if (item.audioStatus === 'failed') {
                return (
                    <Badge variant="destructive" className="gap-1">
                        <Volume2 className="size-3" />
                        Failed
                    </Badge>
                );
            }
            const hasAudio = item.audioStatus === 'completed';
            const Icon = hasAudio ? Volume2 : (item.type === 'youtube' ? Youtube : Globe);
            return (
                <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                    <Icon className="size-3" />
                    Completed
                </Badge>
            );
        }
    };

    const getActivityLink = (item) => {
        if (item.activityType === 'podcast') {
            return `/dashboard/podcast/${item.id}`;
        } else {
            return `/dashboard/summary/${item.id}`;
        }
    };

    const getActivityUrl = (item) => {
        return truncateUrl(item.blogUrl || item.sourceUrl);
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
                <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
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
                    <div className="border border-border rounded-lg overflow-hidden">
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
                                        </TableCell>
                                        <TableCell>{getActivityBadge(item)}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-1 text-amber-600">
                                                <Coins className="size-3" />
                                                {item.activityType === 'podcast' 
                                                    ? (item.credits || pricing.podcast)
                                                    : (pricing.youtubeSummary + (item.audioStatus === 'completed' ? pricing.audioGeneration : 0))
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
                )}
            </div>
        </div>
    );
}
