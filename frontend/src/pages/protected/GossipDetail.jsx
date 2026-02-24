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
    Share2,
    Trash2,
    RefreshCw,
    ArrowLeft,
    Loader2,
    ExternalLink,
    Download,
    Sparkles,
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

export default function GossipDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [gossip, setGossip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [retrying, setRetrying] = useState(false);
    const pollIntervalRef = useRef(null);

    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchGossip();
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [id]);

    useEffect(() => {
        if (gossip && !['completed', 'failed'].includes(gossip.status)) {
            pollIntervalRef.current = setInterval(fetchProgress, 3000);
        }
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [gossip?.status]);

    const fetchGossip = async () => {
        try {
            const res = await api.get(`/gossip/get/${id}`);
            setGossip(res.data.data);
        } catch (error) {
            toast.error('Failed to load gossip');
            navigate('/dashboard/library');
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const res = await api.get(`/gossip/progress/${id}`);
            setGossip((prev) => ({ ...prev, ...res.data.data }));
            if (['completed', 'failed'].includes(res.data.data.status)) {
                clearInterval(pollIntervalRef.current);
                if (res.data.data.status === 'completed') fetchGossip();
            }
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/gossip/delete/${id}`);
            toast.success('Gossip deleted');
            navigate('/dashboard/library');
        } catch (error) {
            toast.error('Failed to delete gossip');
        } finally {
            setDeleting(false);
        }
    };

    const handleRetry = async () => {
        setRetrying(true);
        try {
            await api.post(`/gossip/retry/${id}`);
            toast.success('Retrying gossip generation');
            fetchGossip();
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

    const statusInfo = STATUS_MAP[gossip?.status] || STATUS_MAP.processing;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-pink-500" />
                        <h1 className="text-2xl font-bold">Gossip Details</h1>
                    </div>
                    <a
                        href={gossip?.blogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                        {truncateUrl(gossip?.blogUrl)}
                        <ExternalLink className="size-3" />
                    </a>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Status</CardTitle>
                        <Badge variant={gossip?.status === 'failed' ? 'destructive' : 'secondary'}>
                            {statusInfo.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {gossip?.status === 'failed' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-destructive">
                                {gossip?.errorMessage || 'An error occurred during generation'}
                            </p>
                            <Button onClick={handleRetry} disabled={retrying} variant="outline">
                                {retrying ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
                                Retry Generation
                            </Button>
                        </div>
                    ) : gossip?.status !== 'completed' ? (
                        <div className="space-y-2">
                            <Progress value={statusInfo.progress} className="h-2" />
                            <p className="text-sm text-muted-foreground">{statusInfo.label}... Please wait.</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Your gossip audio is ready to listen! 🎧</p>
                    )}
                </CardContent>
            </Card>

            {gossip?.status === 'completed' && gossip?.audioUrl && (
                <AudioPlayer src={gossip.audioUrl} title="Gossip Audio" />
            )}

            <div className="flex gap-4">
                {gossip?.status === 'completed' && gossip?.audioUrl && (
                    <Button variant="outline" className="flex-1" asChild>
                        <a href={gossip.audioUrl} download={`gossip-${id}.wav`}>
                            <Download className="mr-2 size-4" />
                            Download
                        </a>
                    </Button>
                )}
                {gossip?.status === 'completed' && (
                    <>
                        <Button variant="outline" className="flex-1" onClick={() => setShareDialogOpen(true)}>
                            <Share2 className="mr-2 size-4" />
                            Share
                        </Button>
                        <ShareDialog
                            open={shareDialogOpen}
                            onOpenChange={setShareDialogOpen}
                            url={`${window.location.origin}/share/gossip/${id}`}
                            type="gossip"
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
                    title="Delete Gossip"
                    description="Are you sure you want to delete this gossip? This action cannot be undone."
                />
            </div>
        </div>
    );
}