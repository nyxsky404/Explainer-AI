/**
 * Redirect utilities for opening Explainer-AI website
 */

const BASE_URL = 'http://localhost:5173';

export interface RedirectOptions {
  url?: string;
  type?: 'youtube' | 'web' | 'pdf';
  text?: string;
  topic?: string;
  autoStart?: boolean;
}

/**
 * Open the Explainer-AI website with parameters for summarization
 */
export function openSummarizer(options: RedirectOptions): void {
  const { url, type, autoStart = true } = options;

  if (!url) {
    openWebsite();
    return;
  }

  const params = new URLSearchParams({
    url: url,
    auto: autoStart.toString(),
  });

  if (type) {
    params.set('type', type);
  }

  const redirectUrl = `${BASE_URL}/summarize?${params.toString()}`;
  browser.tabs.create({ url: redirectUrl });
}

/**
 * Open the Explainer-AI website for deep explanation
 */
export function openDeepExplain(options: RedirectOptions): void {
  const { topic, text, autoStart = true } = options;

  const params = new URLSearchParams({
    auto: autoStart.toString(),
  });

  if (topic) {
    params.set('topic', topic);
  }

  if (text) {
    params.set('text', text);
  }

  const redirectUrl = `${BASE_URL}/explain?${params.toString()}`;
  browser.tabs.create({ url: redirectUrl });
}

/**
 * Open the Explainer-AI website home page
 */
export function openWebsite(): void {
  browser.tabs.create({ url: BASE_URL });
}

/**
 * Open the Explainer-AI login page
 */
export function openLoginPage(): void {
  browser.tabs.create({ url: `${BASE_URL}/login` });
}
