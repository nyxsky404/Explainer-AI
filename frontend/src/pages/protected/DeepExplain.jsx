import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { BookOpen, FileText, Upload, Lightbulb, Brain, GraduationCap } from 'lucide-react';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Settings } from 'lucide-react';
import ExplainModeSelector from '@/components/shared/ExplainModeSelector';

export default function DeepExplain() {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [mode, setMode] = useState('easy');
    const [sourceContent, setSourceContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!topic.trim()) {
            toast.error('Please enter a topic to explain');
            return;
        }

        setIsLoading(true);

        try {
            const res = await api.post('/deep-explain/generate', {
                topic: topic.trim(),
                mode,
                sourceContent: sourceContent.trim() || null,
            });

            if (res.data.success) {
                toast.success('Explanation generated successfully! (2 credits used)');
                navigate(`/dashboard/deep-explain/${res.data.data.id}`);
            } else {
                toast.error(res.data.message || 'Failed to generate explanation');
            }
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Page Heading */}
                <div>
                    <h1 className="text-3xl font-bold">AI Deep Explain</h1>
                    <p className="text-muted-foreground">
                        Get expert-level explanations for any topic or concept (2 credits)
                    </p>
                </div>

                {/* Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>What do you want to understand?</CardTitle>
                        <CardDescription>
                            Enter any topic, concept, or question you want explained
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic or Question</Label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="topic"
                                        type="text"
                                        placeholder="e.g., How does photosynthesis work? or Explain quantum entanglement"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Mode Selector */}
                            <ExplainModeSelector value={mode} onChange={setMode} />

                            {/* Advanced Options */}
                            <Collapsible>
                                <CollapsibleTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 text-muted-foreground hover:text-foreground px-0"
                                    >
                                        <Settings className="size-4" />
                                        Advanced Options
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-3 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sourceContent">
                                            Additional Context (Optional)
                                        </Label>
                                        <Textarea
                                            id="sourceContent"
                                            placeholder="Paste any relevant text, notes, or content that provides context for your question..."
                                            value={sourceContent}
                                            onChange={(e) => setSourceContent(e.target.value)}
                                            className="min-h-[120px]"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Providing context helps generate more accurate and relevant
                                            explanations
                                        </p>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? 'Generating Explanation...' : 'Generate Explanation'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
                                <Lightbulb className="size-4" />
                                Easy Mode
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-green-600 dark:text-green-500">
                                Simple language, analogies, perfect for beginners
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <Brain className="size-4" />
                                Intuitive Mode
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-blue-600 dark:text-blue-500">
                                First principles, builds understanding from ground up
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2 text-purple-700 dark:text-purple-400">
                                <GraduationCap className="size-4" />
                                Deep Mode
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-purple-600 dark:text-purple-500">
                                Expert-level, comprehensive with technical details
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
