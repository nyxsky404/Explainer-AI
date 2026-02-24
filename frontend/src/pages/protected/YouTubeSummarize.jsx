import { useState, useEffect } from 'react';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Youtube } from 'lucide-react';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import UrlInputCard from '@/components/shared/UrlInputCard';
import DepthSelector from '@/components/shared/DepthSelector';

import { useNavigate, useSearchParams } from 'react-router';

export default function YouTubeSummarize() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [url, setUrl] = useState('');
    const [depth, setDepth] = useState('standard');
    const [isLoading, setIsLoading] = useState(false);

    // Handle extension parameters
    useEffect(() => {
        const urlParam = searchParams.get('url');
        const auto = searchParams.get('auto') === 'true';
        
        if (urlParam) {
            setUrl(decodeURIComponent(urlParam));
        }
    }, [searchParams]);

    // Auto-submit after URL is set
    useEffect(() => {
        const auto = searchParams.get('auto') === 'true';
        if (url && auto) {
            // Auto-submit if auto=true and URL is set
            const timer = setTimeout(() => {
                handleSubmit({ preventDefault: () => {} });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [url, searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!url.trim()) {
            toast.error('Please enter a YouTube URL');
            return;
        }

        setIsLoading(true);

        try {
            const res = await api.post('/summarize/youtube', { url: url.trim(), depth });
            if (res.data.success) {
                toast.success('Video summarized successfully! (2 credits used)');
                navigate(`/dashboard/summary/${res.data.data.id}`);
            }
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <UrlInputCard
                pageTitle="YouTube Summarizer"
                pageDescription="Get key points from any YouTube video in seconds (2 credits)"
                title="YouTube URL"
                description="Paste the URL of the YouTube video you want to summarize"
                label="Video URL"
                placeholder="https://www.youtube.com/watch?v=..."
                icon={Youtube}
                buttonText="Summarize Video"
                loadingText="Summarizing..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            >
                <DepthSelector value={depth} onChange={setDepth} />
            </UrlInputCard>
        </div>
    );
}
