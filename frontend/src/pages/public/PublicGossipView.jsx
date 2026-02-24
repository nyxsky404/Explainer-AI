import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router';

import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Check, Copy, Share2, Sparkles, ExternalLink, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AudioPlayer from '@/components/shared/AudioPlayer';
import { truncateUrl } from '@/lib/utils';

/**
 * Extract file extension from URL
 * @param {string} url - The URL to extract extension from
 * @returns {string} - The file extension with dot (e.g., '.wav') or default '.wav'
 */
const getFileExtension = (url) => {
    if (!url || typeof url !== 'string') return '.wav';
    try {
        const pathname = new URL(url).pathname;
        const lastDot = pathname.lastIndexOf('.');
        if (lastDot !== -1 && lastDot < pathname.length - 1) {
            const ext = pathname.substring(lastDot);
            if (/^\.[a-zA-Z0-9]{2,4}$/.test(ext)) {
                return ext;
            }
        }
    } catch {
        const lastDot = url.lastIndexOf('.');
        if (lastDot !== -1 && lastDot < url.length - 1) {
            const ext = url.substring(lastDot).split(/[?#]/)[0];
            if (/^\.[a-zA-Z0-9]{2,4}$/.test(ext)) {
                return ext;
            }
        }
    }
    return '.wav';
};

/**
 * Validate if a string is a safe URL (http or https)
 * @param {string} url - The URL to validate
 * @returns {boolean}
 */
const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

export default function PublicGossipView() {
    const { id } = useParams();
    const [gossip, setGossip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const copyTimeoutRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchGossip();
        return () => {
            // Clear timeout on unmount
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
        };
    }, [id]);

    const fetchGossip = async () => {
        try {
            const res = await api.get(`/gossip/share/${id}`);
            setGossip(res.data.data);
        } catch (error) {
            console.error('Failed to fetch gossip:', error);
            toast.error('Failed to load gossip. It might be invalid or deleted.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            // Clear any existing timeout
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
            // Set new timeout and store ref
            copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy link to clipboard');
        }
    };

    const handleDownload = async () => {
        try {
            const url = gossip.audioUrl;
            const filename = `gossip-${id}${getFileExtension(url)}`;
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        } catch (error) {
            console.error('Failed to download:', error);
            toast.error('Failed to download audio');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return '';
        }
    };

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!gossip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">Gossip Not Found</h1>
                <p className="text-muted-foreground mb-6">This gossip link is invalid or has expired.</p>
                <Button asChild>
                    <Link to="/">Go Home</Link>
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
                        <Link to="/dashboard">Dashboard</Link>
                    </Button>
                ) : (
                    <Button asChild size="sm">
                        <Link to="/login">Get Started</Link>
                    </Button>
                )}
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-pink-500" />
                        <Badge variant="outline" className="capitalize">
                            Gossip
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <span>Created by {gossip.author ? gossip.author.split(' ')[0] : 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatDate(gossip.createdAt)}</span>
                    </div>
                    {/* Guard blogUrl - only render link if valid URL */}
                    {isValidUrl(gossip.blogUrl) ? (
                        <a
                            href={gossip.blogUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-1"
                        >
                            {truncateUrl(gossip.blogUrl)}
                            <ExternalLink className="size-3" />
                        </a>
                    ) : (
                        <span className="text-sm text-muted-foreground mt-1">Source URL not available</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                        {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
                        {copied ? 'Copied' : 'Share'}
                    </Button>
                </div>
            </div>

            {/* Audio Player - Guard audioUrl */}
            {gossip.audioUrl && isValidUrl(gossip.audioUrl) ? (
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <AudioPlayer src={gossip.audioUrl} title="Gossip Preview" />
                
                    <div className="mt-6 flex justify-end">
                         <Button variant="outline" onClick={handleDownload}>
                            <Download className="mr-2 size-4" />
                            Download Audio
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-card border rounded-xl p-6 shadow-sm text-center">
                    <p className="text-muted-foreground">No audio available</p>
                </div>
            )}

            <div className="text-center pt-8 pb-4 text-sm text-muted-foreground">
                <p>Generated with Explainer AI ✨</p>
            </div>
        </div>
    );
}