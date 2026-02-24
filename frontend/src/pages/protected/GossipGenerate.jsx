import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import UrlInputCard from '@/components/shared/UrlInputCard';
import DepthSelector from '@/components/shared/DepthSelector';

export default function GossipGenerate() {
    const [url, setUrl] = useState('');
    const [depth, setDepth] = useState('standard');
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
            const res = await api.post('/gossip/generate', { blogUrl: url.trim(), depth });
            if (res.data.success) {
                toast.success('Gossip generation started! ✨');
                navigate(`/dashboard/gossip/${res.data.data.id}`);
            }
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <UrlInputCard
            pageTitle="Gossip Generator"
            pageDescription="Turn any article into a Gen Z-style audio conversation with Maya & Jay (3 credits)"
            title="URL Input"
            description="Paste the URL of the article you want to transform into a gossip"
            label="Article URL"
            placeholder="https://example.com/article"
            icon={Sparkles}
            buttonText="Spill the Tea"
            loadingText="Generating..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onSubmit={handleSubmit}
            isLoading={isLoading}
        >
            <DepthSelector value={depth} onChange={setDepth} />
        </UrlInputCard>
    );
}