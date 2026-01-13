import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import api from '@/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Link2, Upload, X, FileText } from 'lucide-react';

export default function PodcastGenerate() {
    const [url, setUrl] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!url.trim()) {
            toast.error('Please enter a URL');
            return;
        }

        setIsLoading(true);

        try {
            const res = await api.post('/podcast/generate', { blogUrl: url.trim() });
            if (res.data.success) {
                toast.success('Podcast generation started!');
                navigate(`/dashboard/podcast/${res.data.data.id}`);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to generate podcast';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            toast.info('File upload coming soon! Please paste a URL for now.');
        }
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            toast.info('File upload coming soon! Please paste a URL for now.');
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Generate Podcast</h1>
                <p className="text-muted-foreground">
                    Transform any article or blog into an audio podcast
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>URL Input</CardTitle>
                    <CardDescription>
                        Paste the URL of the article you want to convert
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="url">Article URL</Label>
                            <div className="relative">
                                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="url"
                                    type="url"
                                    placeholder="https://example.com/article"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Or Upload File (Coming Soon)</Label>
                            <div
                                className={`border-2 border-dashed p-6 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {file ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <FileText className="size-5" />
                                        <span className="text-sm">{file.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-6"
                                            onClick={removeFile}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Drag and drop a file here, or click to browse
                                        </p>
                                        <input
                                            type="file"
                                            accept=".pdf,.txt,.docx"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload">
                                            <Button type="button" variant="outline" size="sm" asChild>
                                                <span>Browse Files</span>
                                            </Button>
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prompt">Custom Instructions (Optional)</Label>
                            <Textarea
                                id="prompt"
                                placeholder="Add any specific instructions for the podcast generation..."
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Podcast
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
