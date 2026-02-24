import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import DeepExplain from '../protected/DeepExplain';

function ExtensionExplain() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const topic = searchParams.get('topic');
    const text = searchParams.get('text');
    const auto = searchParams.get('auto') === 'true';

    if (!topic && !text) {
      navigate('/dashboard/deep-explain');
      return;
    }

    // Navigate to deep explain with pre-filled content
    const params = new URLSearchParams({ auto: auto.toString() });
    if (topic) params.set('topic', topic);
    if (text) params.set('text', text);

    navigate(`/dashboard/deep-explain?${params.toString()}`);
    setIsRedirecting(false);
  }, [searchParams, navigate]);

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Explainer-AI...</p>
        </div>
      </div>
    );
  }

  return null;
}

export default ExtensionExplain;
