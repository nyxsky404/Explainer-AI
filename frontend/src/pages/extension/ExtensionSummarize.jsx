import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import YouTubeSummarize from '../protected/YouTubeSummarize';
import WebSummarize from '../protected/WebSummarize';
import PdfSummarize from '../protected/PdfSummarize';

function ExtensionSummarize() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const url = searchParams.get('url');
    const type = searchParams.get('type');
    const auto = searchParams.get('auto') === 'true';

    if (!url) {
      navigate('/dashboard');
      return;
    }

    // Redirect to appropriate summarizer page with pre-filled URL
    let targetPath;
    switch (type) {
      case 'youtube':
        targetPath = '/dashboard/youtube-summarize';
        break;
      case 'pdf':
        targetPath = '/dashboard/pdf-summarize';
        break;
      default:
        targetPath = '/dashboard/web-summarize';
    }

    // Navigate with URL parameter
    navigate(`${targetPath}?url=${encodeURIComponent(url)}&auto=${auto}`);
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

export default ExtensionSummarize;
