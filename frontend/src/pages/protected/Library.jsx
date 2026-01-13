import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api from '@/api/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { ExternalLink, Mic, Plus } from 'lucide-react';

export default function Library() {
    const [podcasts, setPodcasts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchPodcasts(currentPage);
    }, [currentPage]);

    const fetchPodcasts = async (page) => {
        setLoading(true);
        try {
            const res = await api.get(`/podcast/get?page=${page}&limit=10`);
            setPodcasts(res.data.data.podcasts || []);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error('Failed to fetch podcasts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            completed: 'default',
            failed: 'destructive',
            processing: 'secondary',
            scraping: 'secondary',
            scraped: 'secondary',
            generating_script: 'secondary',
            script_generated: 'secondary',
            generating_audio: 'secondary',
        };
        return (
            <Badge variant={variants[status] || 'secondary'} className="capitalize">
                {status?.replace(/_/g, ' ')}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const truncateUrl = (url, maxLength = 40) => {
        if (url.length <= maxLength) return url;
        return url.slice(0, maxLength) + '...';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Library</h1>
                    <p className="text-muted-foreground">All your generated podcasts</p>
                </div>
                <Link to="/dashboard/podcast/generate">
                    <Button className="gap-2">
                        <Plus className="size-4" />
                        Create New
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : podcasts.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Mic className="size-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No podcasts yet</h3>
                        <p className="text-muted-foreground mb-4">Create your first podcast to get started</p>
                        <Link to="/dashboard/podcast/generate">
                            <Button>Create Podcast</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Source URL</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-[100px]">Action</TableHead>
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
                                                className="hover:underline inline-flex items-center gap-1"
                                            >
                                                {truncateUrl(podcast.blogUrl)}
                                                <ExternalLink className="size-3" />
                                            </a>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(podcast.status)}</TableCell>
                                        <TableCell>{formatDate(podcast.createdAt)}</TableCell>
                                        <TableCell>
                                            <Link to={`/dashboard/podcast/${podcast.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        className={!pagination.hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => setCurrentPage(page)}
                                            isActive={page === currentPage}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                                        className={!pagination.hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}
        </div>
    );
}
