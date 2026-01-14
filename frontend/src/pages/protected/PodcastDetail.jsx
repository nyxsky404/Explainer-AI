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
    Volume2,
} from 'lucide-react';
import ShareDialog from '@/components/blocks/DetailsDialogs/share-dialog';
import DeletePodcastDialog from '@/components/blocks/DetailsDialogs/delete-podcast-dialog';

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
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);
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
            navigate('/library');
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
            navigate('/library');
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



    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audioRef.current) audioRef.current.currentTime = percent * duration;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Podcast Details</h1>
                    <a
                        href={podcast?.blogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                        {podcast?.blogUrl?.slice(0, 50)}...
                        <ExternalLink className="size-3" />
                    </a>
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
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Volume2 className="size-5" />
                            Audio Player
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <audio
                            ref={audioRef}
                            src={podcast.audioUrl}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={() => setIsPlaying(false)}
                        />
                        <div className="h-2 bg-muted cursor-pointer" onClick={handleSeek}>
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{formatTime(currentTime)}</span>
                            <Button size="icon" onClick={togglePlay} className="size-12">
                                {isPlaying ? <Pause className="size-6" /> : <Play className="size-6 ml-1" />}
                            </Button>
                            <span className="text-sm text-muted-foreground">{formatTime(duration)}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setShareDialogOpen(true)}>
                    <Share2 className="mr-2 size-4" />
                    Share
                </Button>
                <ShareDialog
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                    url={window.location.href}
                />

                <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="mr-2 size-4" />
                    Delete
                </Button>
                <DeletePodcastDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onDelete={handleDelete}
                    isDeleting={deleting}
                />
            </div>
        </div>
    );
}
