import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import api from '@/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Copy, Check, Youtube, Globe, Share2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SummaryDisplay from '@/components/shared/SummaryDisplay';

export default function PublicSummaryView() {
    const { id } = useParams();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const { user } = useAuth(); // Check if user is logged in to show "Go to Dashboard" button

    useEffect(() => {
        fetchSummary();
    }, [id]);

    const fetchSummary = async () => {
        try {
            // Use the public endpoint
            const res = await api.get(`/summary/share/${id}`);
            setSummary(res.data.data);
        } catch (error) {
            console.error('Failed to fetch summary:', error);
            toast.error('Failed to load summary. It might be invalid or deleted.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(summary.content);
        setCopied(true);
        toast.success('Summary copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
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

    if (!summary) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">Summary Not Found</h1>
                <p className="text-muted-foreground mb-6">This summary link is invalid or has been expired.</p>
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
                        {summary.type === 'youtube' ? (
                            <Youtube className="size-5 text-red-500" />
                        ) : (
                            <Globe className="size-5 text-blue-500" />
                        )}
                        <Badge variant="outline" className="capitalize">
                            {summary.type} Summary
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Created by {summary.author.split(' ')[0]}</span>
                        <span>•</span>
                        <span>{formatDate(summary.createdAt)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                        <Share2 className="size-4" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Shared Summary Display Component */}
            <SummaryDisplay
                summary={summary}
                showGenerateAudioButton={false}
            />


            <div className="text-center pt-8 pb-4 text-sm text-muted-foreground">
                <p>Generated with Explainer AI</p>
            </div>
        </div>
    );
}
