import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Layers, Plus, Trash2, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import DepthSelector from '@/components/shared/DepthSelector';
import { Link } from 'react-router';

export default function BatchSummarize() {
    const [urls, setUrls] = useState(['', '', '']);
    const [depth, setDepth] = useState('standard');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);

    const updateUrl = (index, value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

    const addUrlField = () => {
        if (urls.length < 5) {
            setUrls([...urls, '']);
        }
    };

    const removeUrlField = (index) => {
        if (urls.length > 1) {
            const newUrls = urls.filter((_, i) => i !== index);
            setUrls(newUrls);
        }
    };

    const validUrls = urls.filter(u => u.trim().length > 0);
    const totalCost = validUrls.length * 2;

    const handleSubmit = async () => {
        if (validUrls.length === 0) {
            toast.error('Please enter at least one URL');
            return;
        }

        setIsLoading(true);
        setResults(null);

        try {
            const res = await api.post('/summarize/batch', {
                urls: validUrls,
                depth,
            });

            if (res.data.success) {
                setResults(res.data.data);
                toast.success('Batch processing complete!');
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
                <h1 className="text-3xl font-bold">Batch Summarizer</h1>
                <p className="text-muted-foreground">
                    Summarize multiple URLs at once (YouTube videos or Web pages). 2 credits per URL.
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="size-5" />
                            Enter URLs
                        </CardTitle>
                        <CardDescription>
                            Add up to 5 URLs to process in batch.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {urls.map((url, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="https://..."
                                        value={url}
                                        onChange={(e) => updateUrl(index, e.target.value)}
                                        disabled={isLoading}
                                    />
                                    {urls.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeUrlField(index)}
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {urls.length < 5 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addUrlField}
                                disabled={isLoading}
                                className="w-full border-dashed"
                            >
                                <Plus className="mr-2 size-4" />
                                Add another URL
                            </Button>
                        )}

                        <div className="pt-4 border-t">
                            <DepthSelector value={depth} onChange={setDepth} />
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <div className="text-sm text-muted-foreground">
                                Total Cost: <span className="font-semibold text-foreground">{totalCost} credits</span>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={validUrls.length === 0 || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Processing {validUrls.length} URLs...
                                    </>
                                ) : (
                                    'Summarize All'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {results && (
                    <Card className="border-green-500/20 bg-green-500/5">
                        <CardHeader>
                            <CardTitle>Results</CardTitle>
                            <CardDescription>
                                {results.successCount} succeeded, {results.failCount} failed
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {results.results.map((result, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {result.status === 'success' ? (
                                            <CheckCircle className="size-5 text-green-500 shrink-0" />
                                        ) : (
                                            <XCircle className="size-5 text-destructive shrink-0" />
                                        )}
                                        <div className="truncate">
                                            <p className="font-medium truncate text-sm">{result.url}</p>
                                            {result.error && (
                                                <p className="text-xs text-destructive">{result.error}</p>
                                            )}
                                        </div>
                                    </div>
                                    {result.status === 'success' && (
                                        <Link to={`/dashboard/summary/${result.id}`}>
                                            <Button size="sm" variant="outline" className="gap-2">
                                                View
                                                <ExternalLink className="size-3" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
