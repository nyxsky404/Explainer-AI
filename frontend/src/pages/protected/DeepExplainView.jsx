import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trash2, Lightbulb, Brain, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import DeleteDialog from '@/components/blocks/DetailsDialogs/delete-dialog';
import DeepExplainChatPanel from '@/components/shared/DeepExplainChatPanel';

const modeInfo = {
  EASY: { icon: Lightbulb, label: 'Easy', color: 'bg-green-500' },
  INTUITIVE: { icon: Brain, label: 'Intuitive', color: 'bg-blue-500' },
  DEEP: { icon: GraduationCap, label: 'Deep', color: 'bg-purple-500' },
};

export default function DeepExplainView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchExplanation();
    }, [id]);

    const fetchExplanation = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/deep-explain/${id}`);
            setExplanation(res.data.data);
        } catch (error) {
            console.error('Failed to fetch explanation:', error);
            toast.error('Failed to load explanation');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/deep-explain/${id}`);
            toast.success('Explanation deleted successfully');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to delete explanation:', error);
            toast.error('Failed to delete explanation');
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    };


    if (loading) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!explanation) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Explanation not found</p>
            </div>
        );
    }

    const modeData = modeInfo[explanation.mode] || { icon: Lightbulb, label: 'Unknown', color: 'bg-gray-500' };
    const ModeIcon = modeData.icon;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
                    <ArrowLeft className="size-4" />
                    Back to Dashboard
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={deleting}
                >
                    <Trash2 className="size-4 text-destructive" />
                </Button>
            </div>

            {/* Main Explanation Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <CardTitle className="text-2xl">{explanation.topic}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="gap-1.5">
                                    <ModeIcon className="size-3" />
                                    {modeData.label} Mode
                                </Badge>
                                <Badge variant="secondary">
                                    {explanation.creditsUsed} credit{explanation.creditsUsed !== 1 ? 's' : ''} used
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(explanation.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                    <MarkdownRenderer content={explanation.content} />
                </CardContent>
            </Card>

            {/* Chat Panel */}
            <DeepExplainChatPanel
                explanationId={id}
                initialFollowUps={explanation.followUps || []}
            />

            {/* Delete Dialog */}
            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onDelete={handleDelete}
                title="Delete Explanation"
                description="Are you sure you want to delete this explanation? This action cannot be undone."
                isDeleting={deleting}
            />
        </div>
    );
}
