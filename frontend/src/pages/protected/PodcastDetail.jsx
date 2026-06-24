import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
    Play,
    Pause,
    Share2,
    Trash2,
    RefreshCw,
    ArrowLeft,
    Loader2,
    ExternalLink,
    Download,
} from 'lucide-react';
import ShareDialog from '@/components/blocks/DetailsDialogs/share-dialog';
import DeleteDialog from '@/components/blocks/DetailsDialogs/delete-dialog';
import AudioPlayer from '@/components/shared/AudioPlayer';
import { truncateUrl } from '@/lib/utils';

const STATUS_MAP = {
    processing: { label: 'Processing', progress: 10 },
    scraping: { label: 'Scraping Content', progress: 25 },
    scraped: { label: 'Content Scraped', progress: 40 },
    generating_script: { label: 'Generating Script', progress: 55 },
    script_generated: { label: 'Script Ready', progress: 70 },
    generating_audio: { label: 'Generating Audio', progress: 85 },
    completed: { label: 'Completed', progress: 100 },
    failed: { label: 'Failed', progress: 0 },
};

export default function PodcastDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [podcast, setPodcast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [retrying, setRetrying] = useState(false);
    const pollIntervalRef = useRef(null);

    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchPodcast();
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [id]);

    useEffect(() => {
        if (podcast && !['completed', 'failed'].includes(podcast.status)) {
            pollIntervalRef.current = setInterval(fetchProgress, 3000);
        }
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [podcast?.status]);

    const fetchPodcast = async () => {
        try {
            const res = await api.get(`/podcast/get/${id}`);
            setPodcast(res.data.data);
        } catch (error) {
            toast.error('Failed to load podcast');
            navigate('/dashboard/library');
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const res = await api.get(`/podcast/progress/${id}`);
            setPodcast((prev) => ({ ...prev, ...res.data.data }));
            if (['completed', 'failed'].includes(res.data.data.status)) {
                clearInterval(pollIntervalRef.current);
                if (res.data.data.status === 'completed') fetchPodcast();
            }
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/podcast/delete/${id}`);
            toast.success('Podcast deleted');
            navigate('/dashboard/library');
        } catch (error) {
            toast.error('Failed to delete podcast');
        } finally {
            setDeleting(false);
        }
    };

    const handleRetry = async () => {
        setRetrying(true);
        try {
            await api.post(`/podcast/retry/${id}`);
            toast.success('Retrying podcast generation');
            fetchPodcast();
        } catch (error) {
            toast.error('Failed to retry');
        } finally {
            setRetrying(false);
        }
    };





    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const statusInfo = STATUS_MAP[podcast?.status] || STATUS_MAP.processing;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" aria-label="Go back" onClick={() => navigate(-1)}>
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Podcast Details</h1>
                    {podcast?.blogUrl ? (
                        <a
                            href={podcast.blogUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                            {truncateUrl(podcast.blogUrl)}
                            <ExternalLink className="size-3" />
                        </a>
                    ) : (
                        <span className="text-sm text-muted-foreground">Direct Text Input</span>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Status</CardTitle>
                        <Badge variant={podcast?.status === 'failed' ? 'destructive' : 'secondary'}>
                            {statusInfo.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {podcast?.status === 'failed' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-destructive">
                                {podcast?.errorMessage || 'An error occurred during generation'}
                            </p>
                            <Button onClick={handleRetry} disabled={retrying} variant="outline">
                                {retrying ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
                                Retry Generation
                            </Button>
                        </div>
                    ) : podcast?.status !== 'completed' ? (
                        <div className="space-y-2">
                            <Progress value={statusInfo.progress} className="h-2" />
                            <p className="text-sm text-muted-foreground">{statusInfo.label}... Please wait.</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Your podcast is ready to listen!</p>
                    )}
                </CardContent>
            </Card>

            {podcast?.status === 'completed' && podcast?.audioUrl && (
                <AudioPlayer src={podcast.audioUrl} title="Audio Player" />
            )}

            <div className="flex gap-4">
                {podcast?.status === 'completed' && podcast?.audioUrl && (
                    <Button variant="outline" className="flex-1" asChild>
                        <a href={podcast.audioUrl} download={`podcast-${id}.wav`}>
                            <Download className="mr-2 size-4" />
                            Download
                        </a>
                    </Button>
                )}
                {podcast?.status === 'completed' && (
                    <>
                        <Button variant="outline" className="flex-1" onClick={() => setShareDialogOpen(true)}>
                            <Share2 className="mr-2 size-4" />
                            Share
                        </Button>
                        <ShareDialog
                            open={shareDialogOpen}
                            onOpenChange={setShareDialogOpen}
                            url={`${window.location.origin}/share/podcast/${id}`}
                            type="podcast"
                            id={id}
                        />
                    </>
                )}

                <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="mr-2 size-4" />
                    Delete
                </Button>
                <DeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onDelete={handleDelete}
                    isDeleting={deleting}
                    title="Delete Podcast"
                    description="Are you sure you want to delete this podcast? This action cannot be undone."
                />
            </div>
        </div>
    );
}
