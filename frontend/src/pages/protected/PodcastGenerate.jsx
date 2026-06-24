import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Link2, Type, Loader2, Settings } from 'lucide-react';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import DepthSelector from '@/components/shared/DepthSelector';
import FormPageLayout from '@/components/shared/FormPageLayout';

export default function PodcastGenerate() {
    const [inputMode, setInputMode] = useState('url');
    const [url, setUrl] = useState('');
    const [directText, setDirectText] = useState('');
    const [depth, setDepth] = useState('standard');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (inputMode === 'url') {
            if (!url.trim()) {
                toast.error('Please enter a URL');
                return;
            }
        } else {
            if (!directText.trim()) {
                toast.error('Please enter some text');
                return;
            }
            if (directText.trim().length < 100) {
                toast.error('Text is too short (minimum 100 characters)');
                return;
            }
            if (directText.trim().length > 50000) {
                toast.error('Text is too long (maximum 50,000 characters)');
                return;
            }
        }

        setIsLoading(true);

        try {
            const payload = { depth };

            if (inputMode === 'url') {
                payload.blogUrl = url.trim();
            } else {
                payload.directText = directText.trim();
            }

            const res = await api.post('/podcast/generate', payload);
            if (res.data.success) {
                toast.success('Podcast generation started!');
                navigate(`/dashboard/podcast/${res.data.data.id}`);
            }
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormPageLayout
            title="Generate Podcast"
            description="Transform any article or text into an audio podcast (3 credits)"
            center
        >
            {/* Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Content Input</CardTitle>
                    <CardDescription>
                        Provide a URL to scrape or paste text directly
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Tabs
                            value={inputMode}
                            onValueChange={setInputMode}
                            className="w-full"
                        >
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="url" className="gap-2">
                                    <Link2 className="size-4" />
                                    URL
                                </TabsTrigger>
                                <TabsTrigger value="text" className="gap-2">
                                    <Type className="size-4" />
                                    Direct Text
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="url" className="mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="podcast-url">Article URL</Label>
                                    <div className="relative">
                                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="podcast-url"
                                            type="url"
                                            placeholder="https://example.com/article"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="pl-10"
                                            required={inputMode === 'url'}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="text" className="mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="podcast-text">Paste Text</Label>
                                    <Textarea
                                        id="podcast-text"
                                        placeholder="Paste the article or content you want to convert into a podcast..."
                                        className="min-h-[200px] font-mono text-sm resize-y"
                                        value={directText}
                                        onChange={(e) => setDirectText(e.target.value)}
                                        required={inputMode === 'text'}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Minimum 100 characters</span>
                                        <span>{directText.length.toLocaleString()} / 50,000 characters</span>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 text-muted-foreground hover:text-foreground px-0"
                                >
                                    <Settings className="size-4" />
                                    Options
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-3">
                                <DepthSelector value={depth} onChange={setDepth} />
                            </CollapsibleContent>
                        </Collapsible>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? 'Generating...' : 'Generate Podcast'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </FormPageLayout>
    );
}
