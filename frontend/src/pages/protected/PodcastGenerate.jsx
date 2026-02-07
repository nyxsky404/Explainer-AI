import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Link2 } from 'lucide-react';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import UrlInputCard from '@/components/shared/UrlInputCard';

export default function PodcastGenerate() {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
            toast.error(getFriendlyErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <UrlInputCard
            pageTitle="Generate Podcast"
            pageDescription="Transform any article or blog into an audio podcast (3 credits)"
            title="URL Input"
            description="Paste the URL of the article you want to convert"
            label="Article URL"
            placeholder="https://example.com/article"
            icon={Link2}
            buttonText="Generate Podcast"
            loadingText="Generating..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onSubmit={handleSubmit}
            isLoading={isLoading}
        />
    );
}
