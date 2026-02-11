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
import { ExternalLink, Mic, Plus, Youtube, Globe, Library as LibraryIcon, FileText, Type } from 'lucide-react';
import { truncateUrl } from '@/lib/utils';

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
    const [summaryType, setSummaryType] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchData();
    }, [activeTab, activityPage, podcastPage, summaryPage, summaryType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'all') {
                const res = await api.get(`/summarize/activity?page=${activityPage}&limit=15`);
                setActivity(res.data.data.activity || []);
                setActivityPagination(res.data.pagination);
            } else if (activeTab === 'podcasts') {
                const res = await api.get(`/podcast/get?page=${podcastPage}&limit=10`);
                setPodcasts(res.data.data.podcasts || []);
                setPodcastPagination(res.data.pagination);
            } else {
                const typeQuery = summaryType ? `&type=${summaryType}` : '';
                const res = await api.get(`/summarize/list?page=${summaryPage}&limit=10${typeQuery}`);
                setSummaries(res.data.data.summaries || []);
                setSummaryPagination(res.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'youtube') setSummaryType('youtube');
        else if (tab === 'web') setSummaryType('web');
        else if (tab === 'pdf') setSummaryType('pdf');
        else if (tab === 'text') setSummaryType('text');
        else setSummaryType(null);
    };

    const getIcon = (item) => {
        if (item.activityType === 'podcast') {
            return <Mic className="size-4 text-purple-500" />;
        } else if (item.type === 'youtube') {
            return <Youtube className="size-4 text-red-500" />;
        } else if (item.type === 'pdf') {
            return <FileText className="size-4 text-orange-500" />;
        } else if (item.type === 'text') {
            return <Type className="size-4 text-gray-500" />;
        } else {
            return <Globe className="size-4 text-blue-500" />;
        }
    };

    const getBadge = (item) => {
        if (item.activityType === 'podcast') {
            const variants = { completed: 'default', failed: 'destructive' };
            const variant = variants[item.status] || 'secondary';
            const className = item.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : '';
            return (
                <Badge variant={variant} className={`capitalize gap-1 ${className}`}>
                    <Mic className="size-3" />
                    {item.status?.replace(/_/g, ' ')}
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="capitalize gap-1">
                    {item.type === 'youtube' ? <Youtube className="size-3" /> : <Globe className="size-3" />}
                    {item.type} Summary
                </Badge>
            );
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

    const getUrl = (item) => item.blogUrl || item.sourceUrl;
    const getLink = (item) => item.activityType === 'podcast' 
        ? `/dashboard/podcast/${item.id}` 
        : `/dashboard/summary/${item.id}`;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };



    const renderPagination = (pagination, page, setPage) => (
        pagination && pagination.totalPages > 1 && (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className={!pagination.hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map((p) => (
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
                            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                            className={!pagination.hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    );

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
                    <h1 className="text-3xl font-bold">Library</h1>
                    <p className="text-muted-foreground">All your generated content</p>
                </div>
                <Link to="/dashboard/podcast/generate">
                    <Button className="gap-2">
                        <Plus className="size-4" />
                        Create New
                    </Button>
                </Link>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-6 mb-8 h-auto p-1">
                    <TabsTrigger value="all" className="gap-2 py-2">
                        <LibraryIcon className="size-4" />
                        <span className="hidden sm:inline">All</span>
                    </TabsTrigger>
                    <TabsTrigger value="podcasts" className="gap-2 py-2">
                        <Mic className="size-4" />
                        <span className="hidden sm:inline">Podcasts</span>
                    </TabsTrigger>
                    <TabsTrigger value="youtube" className="gap-2 py-2">
                        <Youtube className="size-4" />
                        <span className="hidden sm:inline">YouTube</span>
                    </TabsTrigger>
                    <TabsTrigger value="web" className="gap-2 py-2">
                        <Globe className="size-4" />
                        <span className="hidden sm:inline">Web</span>
                    </TabsTrigger>
                    <TabsTrigger value="pdf" className="gap-2 py-2">
                        <FileText className="size-4" />
                        <span className="hidden sm:inline">PDF</span>
                    </TabsTrigger>
                    <TabsTrigger value="text" className="gap-2 py-2">
                        <Type className="size-4" />
                        <span className="hidden sm:inline">Text</span>
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
                            <div className="border border-border rounded-lg overflow-hidden">
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
                            <div className="border border-border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source URL</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-24">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {podcasts.map((podcast) => (
                                            <TableRow key={podcast.id}>
                                                <TableCell className="font-medium">
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

                {/* YouTube Tab */}
                <TabsContent value="youtube" className="space-y-4 mt-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : summaries.length === 0 ? (
                        emptyState(
                            <Youtube className="size-12 mx-auto mb-4 text-red-400" />,
                            'Summarize your first YouTube video',
                            '/dashboard/youtube-summarize',
                            'Summarize Video'
                        )
                    ) : (
                        <>
                            <div className="border border-border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source URL</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-24">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {summaries.map((summary) => (
                                            <TableRow key={summary.id}>
                                                <TableCell className="font-medium">
                                                    <a
                                                        href={summary.sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline inline-flex items-center gap-2"
                                                    >
                                                        <Youtube className="size-4 text-red-500" />
                                                        {truncateUrl(summary.sourceUrl)}
                                                        <ExternalLink className="size-3" />
                                                    </a>
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

                {/* Web Tab */}
                <TabsContent value="web" className="space-y-4 mt-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : summaries.length === 0 ? (
                        emptyState(
                            <Globe className="size-12 mx-auto mb-4 text-blue-400" />,
                            'Summarize your first web page',
                            '/dashboard/web-summarize',
                            'Summarize Page'
                        )
                    ) : (
                        <>
                            <div className="border border-border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source URL</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-24">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {summaries.map((summary) => (
                                            <TableRow key={summary.id}>
                                                <TableCell className="font-medium">
                                                    <a
                                                        href={summary.sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline inline-flex items-center gap-2"
                                                    >
                                                        <Globe className="size-4 text-blue-500" />
                                                        {truncateUrl(summary.sourceUrl)}
                                                        <ExternalLink className="size-3" />
                                                    </a>
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

                {/* PDF Tab */}
                <TabsContent value="pdf" className="space-y-4 mt-6">
                     {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : summaries.length === 0 ? (
                        emptyState(
                            <FileText className="size-12 mx-auto mb-4 text-orange-400" />,
                            'Summarize your first PDF document',
                            '/dashboard/pdf-summarize',
                            'Summarize PDF'
                        )
                    ) : (
                        <>
                            <div className="border border-border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Filename / URL</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-24">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {summaries.map((summary) => (
                                            <TableRow key={summary.id}>
                                                <TableCell className="font-medium">
                                                    <a
                                                        href={summary.sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline inline-flex items-center gap-2"
                                                    >
                                                        <FileText className="size-4 text-orange-500" />
                                                        PDF Document
                                                        <ExternalLink className="size-3" />
                                                    </a>
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

                {/* Text Tab */}
                <TabsContent value="text" className="space-y-4 mt-6">
                     {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : summaries.length === 0 ? (
                        emptyState(
                            <Type className="size-12 mx-auto mb-4 text-gray-400" />,
                            'Summarize your first text snippet',
                            '/dashboard/text-summarize',
                            'Summarize Text'
                        )
                    ) : (
                        <>
                            <div className="border border-border rounded-lg overflow-hidden">
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
                                                <TableCell className="font-medium">
                                                    <div className="inline-flex items-center gap-2">
                                                        <Type className="size-4 text-gray-500" />
                                                        Pasted Text
                                                    </div>
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
