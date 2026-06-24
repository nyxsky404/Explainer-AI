import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api from '@/api/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { ExternalLink, Mic, Plus, Youtube, Globe, Library as LibraryIcon, FileText, Type, FileQuestion, StickyNote, ChartBar, Sparkles, Brain, Layers } from 'lucide-react';
import { truncateUrl } from '@/lib/utils';
import LibraryItemCard from '@/components/blocks/Dashboard/library-item-card';

export default function Library() {
    const [activity, setActivity] = useState([]);
    const [podcasts, setPodcasts] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [activityPagination, setActivityPagination] = useState(null);
    const [podcastPagination, setPodcastPagination] = useState(null);
    const [summaryPagination, setSummaryPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activityPage, setActivityPage] = useState(1);
    const [podcastPage, setPodcastPage] = useState(1);
    const [summaryPage, setSummaryPage] = useState(1);
    const [gossipPage, setGossipPage] = useState(1);
    const [deepExplainPage, setDeepExplainPage] = useState(1);
    const [summaryType, setSummaryType] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchData();
    }, [activeTab, activityPage, podcastPage, summaryPage, gossipPage, deepExplainPage, summaryType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'all') {
                const res = await api.get(`/summarize/activity?page=${activityPage}&limit=15`);
                const activityData = res.data.data.activity || [];
                const pagination = res.data.pagination;
                // If current page is empty and not page 1, go to last valid page
                if (activityData.length === 0 && pagination && pagination.page > 1) {
                    const lastValidPage = Math.min(pagination.page, pagination.totalPages) || 1;
                    if (lastValidPage !== activityPage) {
                        setActivityPage(lastValidPage);
                        return;
                    }
                }
                setActivity(activityData);
                setActivityPagination(pagination);
            } else if (activeTab === 'podcasts') {
                const res = await api.get(`/podcast/get?page=${podcastPage}&limit=10`);
                const podcastData = res.data.data.podcasts || [];
                const pagination = res.data.pagination;
                if (podcastData.length === 0 && pagination && pagination.page > 1) {
                    const lastValidPage = Math.min(pagination.page, pagination.totalPages) || 1;
                    if (lastValidPage !== podcastPage) {
                        setPodcastPage(lastValidPage);
                        return;
                    }
                }
                setPodcasts(podcastData);
                setPodcastPagination(pagination);
            } else if (activeTab === 'gossip') {
                const res = await api.get(`/gossip/list?page=${gossipPage}&limit=10`);
                const gossipData = res.data.data.gossips || [];
                const pagination = res.data.pagination;
                if (gossipData.length === 0 && pagination && pagination.page > 1) {
                    const lastValidPage = Math.min(pagination.page, pagination.totalPages) || 1;
                    if (lastValidPage !== gossipPage) {
                        setGossipPage(lastValidPage);
                        return;
                    }
                }
                setActivity(gossipData);
                setActivityPagination(pagination);
            } else if (activeTab === 'deepExplain') {
                const res = await api.get(`/deep-explain/list?page=${deepExplainPage}&limit=10`);
                const explanationData = res.data.data.explanations || [];
                const pagination = res.data.pagination;
                if (explanationData.length === 0 && pagination && pagination.page > 1) {
                    const lastValidPage = Math.min(pagination.page, pagination.totalPages) || 1;
                    if (lastValidPage !== deepExplainPage) {
                        setDeepExplainPage(lastValidPage);
                        return;
                    }
                }
                setActivity(explanationData);
                setActivityPagination(pagination);
            } else {
                // Summaries tab - handles youtube, web, pdf, text, batch
                const typeQuery = summaryType ? `&type=${summaryType}` : '';
                const res = await api.get(`/summarize/list?page=${summaryPage}&limit=10${typeQuery}`);
                const summaryData = res.data.data.summaries || [];
                const pagination = res.data.pagination;
                if (summaryData.length === 0 && pagination && pagination.page > 1) {
                    const lastValidPage = Math.min(pagination.page, pagination.totalPages) || 1;
                    if (lastValidPage !== summaryPage) {
                        setSummaryPage(lastValidPage);
                        return;
                    }
                }
                setSummaries(summaryData);
                setSummaryPagination(pagination);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Reset page to 1 when changing tabs
        setActivityPage(1);
        setPodcastPage(1);
        setSummaryPage(1);
        setGossipPage(1);
        setDeepExplainPage(1);
        if (tab === 'youtube') setSummaryType('youtube');
        else if (tab === 'web') setSummaryType('web');
        else if (tab === 'pdf') setSummaryType('pdf');
        else if (tab === 'text') setSummaryType('text');
        else setSummaryType(null);
    };

    const getIcon = (item) => {
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

    const getBadge = (item) => {
        switch (item.activityType) {
            case 'podcast': {
                const variants = { completed: 'default', failed: 'destructive' };
                const variant = variants[item.status] || 'secondary';
                const className = item.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : '';
                return (
                    <Badge variant={variant} className={`capitalize gap-1 ${className}`}>
                        <Mic className="size-3" />
                        {item.status?.replace(/_/g, ' ')}
                    </Badge>
                );
            }
            case 'gossip': {
                const variants = { completed: 'default', failed: 'destructive' };
                const variant = variants[item.status] || 'secondary';
                const className = item.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : '';
                return (
                    <Badge variant={variant} className={`capitalize gap-1 ${className}`}>
                        <Sparkles className="size-3" />
                        {item.status?.replace(/_/g, ' ')}
                    </Badge>
                );
            }
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
                // Use getSummaryBadge helper for consistent rendering
                return getSummaryBadge(item.type || 'web');
        }
    };

    const getStatusBadge = (status) => {
        const variants = { completed: 'default', failed: 'destructive' };
        const variant = variants[status] || 'secondary';
        const className = status === 'completed' ? 'bg-green-500 hover:bg-green-600' : '';
        return (
            <Badge variant={variant} className={`capitalize ${className}`}>
                {status?.replace(/_/g, ' ')}
            </Badge>
        );
    };

    const getSummaryBadge = (type) => {
        let Icon = Globe;
        if (type === 'youtube') Icon = Youtube;
        else if (type === 'pdf') Icon = FileText;
        else if (type === 'text') Icon = Type;

        return (
            <Badge variant="outline" className="capitalize gap-1">
                <Icon className="size-3" />
                {type}
            </Badge>
        );
    };

    const getUrl = (item) => item.blogUrl || item.sourceUrl || item.title || item.topic || 'Content';
    const getLink = (item) => {
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };



    const renderPagination = (pagination, page, setPage) => {
        if (!pagination || pagination.totalPages <= 1) return null;
        
        const { totalPages, hasPrevPage, hasNextPage } = pagination;
        
        // Calculate visible page range
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Adjust start if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className={!hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                    {pages.map((p) => (
                        <PaginationItem key={p}>
                            <PaginationLink
                                onClick={() => setPage(p)}
                                isActive={p === page}
                                className="cursor-pointer"
                            >
                                {p}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    const emptyState = (icon, message, link, linkText) => (
        <Card>
            <CardContent className="py-12 text-center">
                {icon}
                <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                <p className="text-muted-foreground mb-4">{message}</p>
                <Link to={link}>
                    <Button>{linkText}</Button>
                </Link>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Library</h1>
                    <p className="text-muted-foreground">All your generated content</p>
                </div>
                <Link to="/dashboard/podcast/generate">
                    <Button className="gap-2 shrink-0">
                        <Plus className="size-4" />
                        <span className="hidden sm:inline">Create New</span>
                    </Button>
                </Link>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-5 mb-8 h-auto p-1">
                    <TabsTrigger value="all" className="gap-2 py-2">
                        <LibraryIcon className="size-4" />
                        <span className="hidden sm:inline">All</span>
                    </TabsTrigger>
                    <TabsTrigger value="podcasts" className="gap-2 py-2">
                        <Mic className="size-4" />
                        <span className="hidden sm:inline">Podcasts</span>
                    </TabsTrigger>
                    <TabsTrigger value="gossip" className="gap-2 py-2">
                        <Sparkles className="size-4" />
                        <span className="hidden sm:inline">Gossip</span>
                    </TabsTrigger>
                    <TabsTrigger value="deepExplain" className="gap-2 py-2">
                        <Brain className="size-4" />
                        <span className="hidden sm:inline">Deep Explain</span>
                    </TabsTrigger>
                    <TabsTrigger value="summaries" className="gap-2 py-2">
                        <FileText className="size-4" />
                        <span className="hidden sm:inline">Summaries</span>
                    </TabsTrigger>
                </TabsList>

                {/* All Tab - Unified Activity */}
                <TabsContent value="all" className="space-y-4 mt-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : activity.length === 0 ? (
                        emptyState(
                            <LibraryIcon className="size-12 mx-auto mb-4 text-muted-foreground" />,
                            'Create your first content to get started',
                            '/dashboard/podcast/generate',
                            'Get Started'
                        )
                    ) : (
                        <>
                            {/* Mobile: card list */}
                            <div className="space-y-3 md:hidden">
                                {activity.map((item) => (
                                    <LibraryItemCard
                                        key={`m-${item.activityType || 'summary'}-${item.id}`}
                                        icon={getIcon(item)}
                                        title={item.blogUrl || item.sourceUrl ? truncateUrl(getUrl(item)) : getUrl(item)}
                                        badge={getBadge(item)}
                                        date={formatDate(item.createdAt)}
                                        to={getLink(item)}
                                        hasExternal={!!(item.blogUrl || item.sourceUrl)}
                                    />
                                ))}
                            </div>
                            {/* Desktop: table */}
                            <div className="hidden md:block border border-border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-24">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activity.map((item) => (
                                            <TableRow key={`${item.activityType || 'summary'}-${item.id}`}>
                                                <TableCell className="font-medium max-w-md">
                                                    {item.blogUrl || item.sourceUrl ? (
                                                        <a
                                                            href={getUrl(item)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline inline-flex items-center gap-2"
                                                        >
                                                            {getIcon(item)}
                                                            <span className="truncate">{truncateUrl(getUrl(item))}</span>
                                                            <ExternalLink className="size-3 shrink-0" />
                                                        </a>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2">
                                                            {getIcon(item)}
                                                            <span className="truncate">{getUrl(item)}</span>
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getBadge(item)}</TableCell>
                                                <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                                                <TableCell>
                                                    <Link to={getLink(item)}>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {renderPagination(activityPagination, activityPage, setActivityPage)}
                        </>
                    )}
                </TabsContent>

                {/* Podcasts Tab */}
                <TabsContent value="podcasts" className="space-y-4 mt-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : podcasts.length === 0 ? (
                        emptyState(
                            <Mic className="size-12 mx-auto mb-4 text-muted-foreground" />,
                            'Create your first podcast',
                            '/dashboard/podcast/generate',
                            'Create Podcast'
                        )
                    ) : (
                        <>
                            {/* Mobile: card list */}
                            <div className="space-y-3 md:hidden">
                                {podcasts.map((podcast) => (
                                    <LibraryItemCard
                                        key={`m-${podcast.id}`}
                                        icon={<Mic className="size-4 text-purple-500" />}
                                        title={podcast.blogUrl ? truncateUrl(podcast.blogUrl) : 'Direct Text'}
                                        badge={getStatusBadge(podcast.status)}
                                        date={formatDate(podcast.createdAt)}
                                        to={`/dashboard/podcast/${podcast.id}`}
                                        hasExternal={!!podcast.blogUrl}
                                    />
                                ))}
                            </div>
                            {/* Desktop: table */}
                            <div className="hidden md:block border border-border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-24">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {podcasts.map((podcast) => (
                                            <TableRow key={podcast.id}>
                                                <TableCell className="font-medium">
                                                    {podcast.blogUrl ? (
                                                        <a
                                                            href={podcast.blogUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline inline-flex items-center gap-2"
                                                        >
                                                            <Mic className="size-4 text-purple-500" />
                                                            {truncateUrl(podcast.blogUrl)}
                                                            <ExternalLink className="size-3" />
                                                        </a>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2">
                                                            <Mic className="size-4 text-purple-500" />
                                                            <span className="truncate">Direct Text</span>
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(podcast.status)}</TableCell>
                                                <TableCell className="text-muted-foreground">{formatDate(podcast.createdAt)}</TableCell>
                                                <TableCell>
                                                    <Link to={`/dashboard/podcast/${podcast.id}`}>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {renderPagination(podcastPagination, podcastPage, setPodcastPage)}
                        </>
                    )}
                </TabsContent>

                {/* Gossip Tab */}
                <TabsContent value="gossip" className="space-y-4 mt-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : activity.length === 0 ? (
                        emptyState(
                            <Sparkles className="size-12 mx-auto mb-4 text-pink-400" />,
                            'Create your first gossip content',
                            '/dashboard/gossip/generate',
                            'Create Gossip'
                        )
                    ) : (
                        <>
                            {/* Mobile: card list */}
                            <div className="space-y-3 md:hidden">
                                {activity.map((item) => (
                                    <LibraryItemCard
                                        key={`m-${item.id}`}
                                        icon={<Sparkles className="size-4 text-pink-500" />}
                                        title={item.blogUrl ? truncateUrl(item.blogUrl) : 'Gossip Content'}
                                        badge={getStatusBadge(item.status)}
                                        date={formatDate(item.createdAt)}
                                        to={`/dashboard/gossip/${item.id}`}
                                        hasExternal={!!item.blogUrl}
                                    />
                                ))}
                            </div>
                            {/* Desktop: table */}
                            <div className="hidden md:block border border-border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-24">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activity.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium max-w-md">
                                                    {item.blogUrl ? (
                                                        <a
                                                            href={item.blogUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline inline-flex items-center gap-2"
                                                        >
                                                            <Sparkles className="size-4 text-pink-500" />
                                                            <span className="truncate">{truncateUrl(item.blogUrl)}</span>
                                                            <ExternalLink className="size-3 shrink-0" />
                                                        </a>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2">
                                                            <Sparkles className="size-4 text-pink-500" />
                                                            <span className="truncate">Gossip Content</span>
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                                                <TableCell>
                                                    <Link to={`/dashboard/gossip/${item.id}`}>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {renderPagination(activityPagination, gossipPage, setGossipPage)}
                        </>
                    )}
                </TabsContent>

                {/* Deep Explain Tab */}
                <TabsContent value="deepExplain" className="space-y-4 mt-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : activity.length === 0 ? (
                        emptyState(
                            <Brain className="size-12 mx-auto mb-4 text-emerald-400" />,
                            'Get your first deep explanation',
                            '/dashboard/deep-explain',
                            'Explain Topic'
                        )
                    ) : (
                        <>
                            {/* Mobile: card list */}
                            <div className="space-y-3 md:hidden">
                                {activity.map((item) => (
                                    <LibraryItemCard
                                        key={`m-${item.id}`}
                                        icon={<Brain className="size-4 text-emerald-500" />}
                                        title={item.topic}
                                        badge={<Badge variant="outline" className="capitalize gap-1">{item.mode}</Badge>}
                                        date={formatDate(item.createdAt)}
                                        to={`/dashboard/deep-explain/${item.id}`}
                                    />
                                ))}
                            </div>
                            {/* Desktop: table */}
                            <div className="hidden md:block border border-border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Topic</TableHead>
                                            <TableHead>Mode</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-24">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activity.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <span className="inline-flex items-center gap-2">
                                                        <Brain className="size-4 text-emerald-500" />
                                                        <span className="truncate">{item.topic}</span>
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize gap-1">
                                                        {item.mode}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                                                <TableCell>
                                                    <Link to={`/dashboard/deep-explain/${item.id}`}>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {renderPagination(activityPagination, deepExplainPage, setDeepExplainPage)}
                        </>
                    )}
                </TabsContent>

                {/* Summaries Tab - Consolidated */}
                <TabsContent value="summaries" className="space-y-4 mt-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : summaries.length === 0 ? (
                        emptyState(
                            <FileText className="size-12 mx-auto mb-4 text-muted-foreground" />,
                            'Create your first summary',
                            '/dashboard/youtube-summarize',
                            'Summarize Content'
                        )
                    ) : (
                        <>
                            {/* Mobile: card list */}
                            <div className="space-y-3 md:hidden">
                                {summaries.map((summary) => (
                                    <LibraryItemCard
                                        key={`m-${summary.id}`}
                                        icon={summary.type === 'youtube' ? <Youtube className="size-4 text-red-500" /> :
                                            summary.type === 'pdf' ? <FileText className="size-4 text-orange-500" /> :
                                            summary.type === 'text' ? <Type className="size-4 text-gray-500" /> :
                                            <Globe className="size-4 text-blue-500" />}
                                        title={summary.sourceUrl ? truncateUrl(summary.sourceUrl) : 'Pasted Text'}
                                        badge={getSummaryBadge(summary.type)}
                                        date={formatDate(summary.createdAt)}
                                        to={`/dashboard/summary/${summary.id}`}
                                        hasExternal={!!summary.sourceUrl}
                                    />
                                ))}
                            </div>
                            {/* Desktop: table */}
                            <div className="hidden md:block border border-border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-24">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {summaries.map((summary) => (
                                            <TableRow key={summary.id}>
                                                <TableCell className="font-medium max-w-md">
                                                    {summary.sourceUrl ? (
                                                        <a
                                                            href={summary.sourceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline inline-flex items-center gap-2"
                                                        >
                                                            {summary.type === 'youtube' ? <Youtube className="size-4 text-red-500" /> : 
                                                             summary.type === 'pdf' ? <FileText className="size-4 text-orange-500" /> :
                                                             summary.type === 'text' ? <Type className="size-4 text-gray-500" /> :
                                                             <Globe className="size-4 text-blue-500" />}
                                                            <span className="truncate">{truncateUrl(summary.sourceUrl)}</span>
                                                            <ExternalLink className="size-3 shrink-0" />
                                                        </a>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2">
                                                            <Type className="size-4 text-gray-500" />
                                                            <span className="truncate">Pasted Text</span>
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getSummaryBadge(summary.type)}</TableCell>
                                                <TableCell className="text-muted-foreground">{formatDate(summary.createdAt)}</TableCell>
                                                <TableCell>
                                                    <Link to={`/dashboard/summary/${summary.id}`}>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {renderPagination(summaryPagination, summaryPage, setSummaryPage)}
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
