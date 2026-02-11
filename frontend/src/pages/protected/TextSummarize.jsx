import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Type, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import DepthSelector from '@/components/shared/DepthSelector';

export default function TextSummarize() {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [depth, setDepth] = useState('standard');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim()) return;

        if (text.length < 100) {
            toast.error('Text is too short (minimum 100 characters)');
            return;
        }

        if (text.length > 50000) {
            toast.error('Text is too long (maximum 50,000 characters)');
            return;
        }

        setIsLoading(true);

        try {
            const res = await api.post('/summarize/text', {
                text: text.trim(),
                depth,
            });

            if (res.data.success) {
                toast.success('Text summarized successfully! (2 credits used)');
                navigate(`/dashboard/summary/${res.data.data.id}`);
            }
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Text Summarizer</h1>
                <p className="text-muted-foreground">
                    Paste any text to extract key insights and get a summary (2 credits)
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Type className="size-5" />
                        Paste Text
                    </CardTitle>
                    <CardDescription>
                        Enter the text you want to summarize (100 - 50,000 characters)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Paste your text here..."
                            className="min-h-[300px] font-mono text-sm resize-y"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="flex justify-end text-xs text-muted-foreground">
                            {text.length} / 50,000 characters
                        </div>
                    </div>

                    <div className="space-y-4">
                        <DepthSelector value={depth} onChange={setDepth} />

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={!text.trim() || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Summarizing...
                                </>
                            ) : (
                                'Summarize Text'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
