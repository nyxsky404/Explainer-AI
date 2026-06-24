import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { FileText, Upload, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import DepthSelector from '@/components/shared/DepthSelector';
import FormPageLayout from '@/components/shared/FormPageLayout';

export default function PdfSummarize() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [depth, setDepth] = useState('standard');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf') {
            toast.error('Only PDF files are allowed');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files?.[0];
        validateAndSetFile(droppedFile);
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setIsLoading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('depth', depth);

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 500);

            const res = await api.post('/summarize/pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (res.data.success) {
                toast.success('PDF summarized successfully! (2 credits used)');
                navigate(`/dashboard/summary/${res.data.data.id}`);
            }
        } catch (error) {
            setUploadProgress(0);
            toast.error(getFriendlyErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormPageLayout
            title="PDF Summarizer"
            description="Upload and summarize research papers, reports, or articles (2 credits)"
            center
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="size-5" />
                        Upload Document
                    </CardTitle>
                    <CardDescription>
                        Select a PDF file to summarize (max 10MB)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                            <Upload className="size-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-1">
                                Drop PDF here or click to browse
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Support for PDF files up to 10MB
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>
                    ) : (
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded">
                                        <FileText className="size-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium truncate max-w-[200px] sm:max-w-xs">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                {!isLoading && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Remove file"
                                        onClick={removeFile}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                )}
                            </div>

                            {isLoading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Processing...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-2" />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <DepthSelector value={depth} onChange={setDepth} />

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={!file || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Summarizing...
                                </>
                            ) : (
                                'Summarize PDF'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </FormPageLayout>
    );
}
