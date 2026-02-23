import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import api from '@/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Trash2, Loader2, Send, Lightbulb, Brain, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import DeleteDialog from '@/components/blocks/DetailsDialogs/delete-dialog';

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
    const [followUpQuestion, setFollowUpQuestion] = useState('');
    const [askingFollowUp, setAskingFollowUp] = useState(false);
    const followUpRef = useRef(null);

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

    const handleFollowUp = async (e) => {
        e.preventDefault();
        if (!followUpQuestion.trim()) {
            toast.error('Please enter a question');
            return;
        }

        setAskingFollowUp(true);
        try {
            const res = await api.post(`/deep-explain/${id}/follow-up`, {
                question: followUpQuestion.trim(),
            });

            if (res.data.success) {
                setExplanation(res.data.data.explanation);
                setFollowUpQuestion('');
                toast.success('Follow-up answered! (1 credit used)');
                // Scroll to new follow-up
                setTimeout(() => {
                    followUpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                toast.error(res.data.message || 'Failed to get follow-up answer');
            }
        } catch (error) {
            console.error('Failed to ask follow-up:', error);
            toast.error(getFriendlyErrorMessage(error));
        } finally {
            setAskingFollowUp(false);
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

            {/* Follow-Up Questions Section */}
            {explanation.followUps && explanation.followUps.length > 0 && (
                <div className="space-y-4" ref={followUpRef}>
                    <h3 className="text-lg font-semibold">Follow-Up Questions</h3>
                    {explanation.followUps.map((followUp, index) => (
                        <Card key={index}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Q: {followUp.question}</CardTitle>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none text-sm">
                                <MarkdownRenderer content={followUp.answer} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Ask Follow-Up Question Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Ask a Follow-Up Question</CardTitle>
                    <CardDescription>
                        Drill deeper or clarify any part of the explanation (1 credit per question)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFollowUp} className="flex gap-2">
                        <Input
                            placeholder="e.g., Can you explain that second part in more detail?"
                            value={followUpQuestion}
                            onChange={(e) => setFollowUpQuestion(e.target.value)}
                            disabled={askingFollowUp}
                        />
                        <Button type="submit" disabled={askingFollowUp} aria-label={askingFollowUp ? 'Sending follow-up' : 'Send follow-up'}>
                            {askingFollowUp ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Send className="size-4" />
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                title="Delete Explanation"
                description="Are you sure you want to delete this explanation? This action cannot be undone."
                isLoading={deleting}
            />
        </div>
    );
}
