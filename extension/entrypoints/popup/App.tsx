import { useState, useEffect } from 'react';
import { parseUrl, getShortUrl, validateYouTubeUrl, validateWebUrl, isYouTubeNonVideoPage, type ContentType } from '@/utils/urlParser';
import { openSummarizer, openDeepExplain, openWebsite } from '@/utils/redirect';
import './App.css';

function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>('unknown');
  const [isSupported, setIsSupported] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [topicInput, setTopicInput] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    loadCurrentTab();
  }, []);

  async function loadCurrentTab() {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.url) {
        const parsed = parseUrl(tab.url);
        setCurrentUrl(parsed.url);
        setContentType(parsed.type);
        setIsSupported(parsed.isSupported);
      }
    } catch (error) {
      console.error('Failed to get current tab:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSummarize() {
    const urlToUse = manualInput.trim() || currentUrl;
    if (!urlToUse) {
      setValidationError('Please enter a URL');
      return;
    }

    // Clear previous error
    setValidationError('');

    const parsed = parseUrl(urlToUse);
    
    // Additional validation for YouTube URLs
    if (parsed.type === 'youtube') {
      const validation = validateYouTubeUrl(urlToUse);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid YouTube URL');
        return;
      }
    }

    // Additional validation for web URLs
    if (parsed.type === 'web') {
      const validation = validateWebUrl(urlToUse);
      if (!validation.isValid) {
        setValidationError(validation.error || 'This URL is not supported for summarization');
        return;
      }
    }

    if (!parsed.isSupported) {
      setValidationError('This URL type is not supported');
      return;
    }

    openSummarizer({
      url: parsed.url,
      type: parsed.type === 'youtube' ? 'youtube' : parsed.type === 'pdf' ? 'pdf' : 'web',
      autoStart: true,
    });
    window.close();
  }

  function handleExplainTopic() {
    if (!topicInput.trim()) return;
    setValidationError('');
    openDeepExplain({ topic: topicInput.trim(), autoStart: true });
    window.close();
  }

  function handleOpenWebsite() {
    setValidationError('');
    openWebsite();
    window.close();
  }

  function handleManualInputChange(value: string) {
    setManualInput(value);
    setValidationError(''); // Clear error when user types
  }

  function getTypeLabel(type: ContentType): string {
    switch (type) {
      case 'youtube':
        return '🎬 YouTube Video';
      case 'web':
        return '🌐 Web Page';
      case 'pdf':
        return '📄 PDF Document';
      case 'restricted':
        return '⚠️ Restricted Page';
      default:
        return '🔗 URL';
    }
  }

  function getTypeColor(type: ContentType): string {
    switch (type) {
      case 'youtube':
        return '#ff0000';
      case 'web':
        return '#4285f4';
      case 'pdf':
        return '#ea4335';
      default:
        return '#666';
    }
  }

  return (
    <div className="popup-container">
      <header className="header">
        <h1>🤖 Explainer-AI</h1>
      </header>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {isSupported && currentUrl && (
            <section className="current-page">
              <div className="type-badge" style={{ backgroundColor: getTypeColor(contentType) }}>
                {getTypeLabel(contentType)}
              </div>
              <div className="url-display" title={currentUrl}>
                {getShortUrl(currentUrl, 40)}
              </div>
              <button className="primary-btn" onClick={handleSummarize}>
                ⚡ Summarize
              </button>
            </section>
          )}

          {contentType === 'restricted' && (
            <section className="restricted-notice">
              <p>⚠️ Cannot access this page</p>
              <p className="hint">Try on a regular website or YouTube</p>
            </section>
          )}

          {isYouTubeNonVideoPage(currentUrl) && (
            <section className="restricted-notice">
              <p>🎬 YouTube non-video page</p>
              <p className="hint">Please navigate to a specific YouTube video to summarize</p>
            </section>
          )}

          <section className="manual-input">
            <h3>Paste URL manually</h3>
            <div className="input-row">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={manualInput}
                onChange={(e) => handleManualInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSummarize()}
                className={validationError ? 'error' : ''}
              />
              <button onClick={handleSummarize} disabled={!manualInput.trim() && !currentUrl}>
                Go
              </button>
            </div>
            {validationError && (
              <div className="validation-error">
                {validationError}
              </div>
            )}
          </section>

          <section className="topic-input">
            <h3>Explain a topic</h3>
            <div className="input-row">
              <input
                type="text"
                placeholder="e.g., How do black holes work?"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplainTopic()}
              />
              <button onClick={handleExplainTopic} disabled={!topicInput.trim()}>
                Explain
              </button>
            </div>
          </section>

          <footer className="footer">
            <button className="link-btn" onClick={handleOpenWebsite}>
              Open Explainer-AI →
            </button>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
