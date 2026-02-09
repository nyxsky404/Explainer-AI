import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import ReactMarkdown from 'react-markdown';
import api from '@/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { ArrowLeft, Youtube, Globe, Share2, Trash2 } from 'lucide-react';
import SummaryDisplay from '@/components/shared/SummaryDisplay';
import ShareDialog from '@/components/blocks/DetailsDialogs/share-dialog';
import DeleteDialog from '@/components/blocks/DetailsDialogs/delete-dialog';
import ChatPanel from '@/components/shared/ChatPanel';

export default function SummaryView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generatingAudio, setGeneratingAudio] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [explaining, setExplaining] = useState(false);
    const chatPanelRef = useRef(null);

    useEffect(() => {
        fetchSummary();
    }, [id]);

    // Polling for audio generation status
    useEffect(() => {
        if (summary?.audioStatus !== 'generating') return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await api.get(`/summarize/${id}`);
                const updatedSummary = res.data.data;
                setSummary(updatedSummary);

                if (updatedSummary.audioStatus === 'completed') {
                    toast.success('Audio generated successfully!');
                    clearInterval(pollInterval);
                } else if (updatedSummary.audioStatus === 'failed') {
                    toast.error('Audio generation failed. Please try again.');
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [summary?.audioStatus, id]);

    const fetchSummary = async () => {
        try {
            const res = await api.get(`/summarize/${id}`);
            setSummary(res.data.data);
        } catch (error) {
            console.error('Failed to fetch summary:', error);
            toast.error('Failed to load summary');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAudio = async () => {
        setGeneratingAudio(true);
        try {
            const res = await api.post(`/summarize/${id}/audio`);
            if (res.data.success) {
                // Update the summary state with new audioStatus
                setSummary((prev) => ({ 
                    ...prev, 
                    audioStatus: res.data.data.audioStatus,
                    audioUrl: res.data.data.audioUrl || prev?.audioUrl
                }));
                if (res.data.data.audioStatus === 'generating') {
                    toast.info('Audio generation started...');
                } else if (res.data.data.audioUrl) {
                    toast.success('Audio generated successfully!');
                }
            }
        } catch (error) {
            console.error('Failed to generate audio:', error);
            toast.error(error.response?.data?.message || 'Failed to generate audio');
        } finally {
            setGeneratingAudio(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/summarize/${id}`);
            toast.success('Summary deleted successfully');
            navigate('/dashboard/library');
        } catch (error) {
            console.error('Failed to delete summary:', error);
            toast.error('Failed to delete summary');
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Summary not found</p>
                <Link to="/dashboard/library">
                    <Button variant="outline" className="mt-4">
                        Back to Library
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/dashboard/library">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="size-4" />
                    </Button>
                </Link>
                <div className="flex-1">
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
                    <p className="text-sm text-muted-foreground mt-1">{formatDate(summary.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                    {summary.audioUrl && (
                         <Button variant="outline" size="sm" asChild className="gap-2">
                             <a href={summary.audioUrl} download={`summary-${id}.wav`}>
                                 <Download className="size-4" />
                                 Download
                             </a>
                         </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)} className="gap-2">
                        <Share2 className="size-4" />
                        Share
                    </Button>
                    <ShareDialog
                        open={shareDialogOpen}
                        onOpenChange={setShareDialogOpen}
                        url={`${window.location.origin}/share/summary/${id}`}
                    />

                    <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)} className="gap-2 text-destructive hover:text-destructive">
                        <Trash2 className="size-4" />
                        Delete
                    </Button>
                    <DeleteDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        onDelete={handleDelete}
                        isDeleting={deleting}
                        title="Delete Summary"
                        description="This will permanently delete this summary and its audio (if generated). This action cannot be undone."
                    />
                </div>
            </div>

            {/* Shared Summary Display Component */}
            <SummaryDisplay
                summary={summary}
                onGenerateAudio={handleGenerateAudio}
                isGeneratingAudio={generatingAudio || summary.audioStatus === 'generating'}
                showGenerateAudioButton={true}
                onExplainRequest={async (selectedText) => {
                    if (explaining) return;
                    setExplaining(true);
                    toast.info('Getting explanation...');
                    try {
                        const res = await api.post(`/chat/${id}/explain`, { selectedText });
                        if (res.data.success) {
                            chatPanelRef.current?.addExplainMessage(selectedText, res.data.data.explanation);
                            toast.success('Explanation ready — see chat below');
                        }
                    } catch (err) {
                        toast.error(err.response?.data?.message || 'Failed to explain');
                    } finally {
                        setExplaining(false);
                    }
                }}
            />

            {/* Interactive Chat Panel */}
            <ChatPanel ref={chatPanelRef} summaryId={id} />
        </div>
    );
}
