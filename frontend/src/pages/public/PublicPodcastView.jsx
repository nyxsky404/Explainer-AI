import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Check, Copy, Share2, Headphones, ExternalLink, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AudioPlayer from '@/components/shared/AudioPlayer';
import { truncateUrl } from '@/lib/utils';

export default function PublicPodcastView() {
    const { id } = useParams();
    const [podcast, setPodcast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchPodcast();
    }, [id]);

    const fetchPodcast = async () => {
        try {
            const res = await api.get(`/podcast/share/${id}`);
            setPodcast(res.data.data);
        } catch (error) {
            console.error('Failed to fetch podcast:', error);
            toast.error('Failed to load podcast. It might be invalid or deleted.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!podcast) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">Podcast Not Found</h1>
                <p className="text-muted-foreground mb-6">This podcast link is invalid or has been expired.</p>
                <Button asChild>
                    <a href="/">Go Home</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl tracking-tight">Explainer AI</span>
                </div>
                {user ? (
                    <Button asChild variant="outline" size="sm">
                        <a href="/dashboard">Dashboard</a>
                    </Button>
                ) : (
                    <Button asChild size="sm">
                        <a href="/login">Get Started</a>
                    </Button>
                )}
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Headphones className="size-5 text-purple-500" />
                        <Badge variant="outline" className="capitalize">
                            Podcast
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <span>Created by {podcast.author ? podcast.author.split(' ')[0] : 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatDate(podcast.createdAt)}</span>
                    </div>
                    <a
                        href={podcast.blogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-1"
                    >
                        {truncateUrl(podcast.blogUrl)}
                        <ExternalLink className="size-3" />
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                        {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
                        {copied ? 'Copied' : 'Share'}
                    </Button>
                </div>
            </div>

            {/* Audio Player */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <AudioPlayer src={podcast.audioUrl} title="Podcast Preview" />
            
                <div className="mt-6 flex justify-end">
                     <Button variant="outline" asChild>
                        <a href={podcast.audioUrl} download={`podcast-${id}.wav`}>
                            <Download className="mr-2 size-4" />
                            Download Audio
                        </a>
                    </Button>
                </div>
            </div>

            <div className="text-center pt-8 pb-4 text-sm text-muted-foreground">
                <p>Generated with Explainer AI</p>
            </div>
        </div>
    );
}
