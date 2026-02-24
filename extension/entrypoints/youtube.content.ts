import { parseUrl } from '@/utils/urlParser';
import { openSummarizer } from '@/utils/redirect';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  main(ctx) {
    // Initial injection
    injectSummarizeButton();

    // Handle YouTube SPA navigation
    ctx.addEventListener(window, 'wxt:locationchange', () => {
      // Remove existing button and re-inject
      const existingBtn = document.getElementById('explainer-ai-btn');
      if (existingBtn) {
        existingBtn.remove();
      }
      // Small delay to let YouTube render the new page
      setTimeout(injectSummarizeButton, 1000);
    });
  },
});

function injectSummarizeButton() {
  // Only inject on watch pages
  if (!window.location.href.includes('youtube.com/watch')) {
    return;
  }

  // Try multiple selectors for the interaction bar
  const selectors = [
    '#top-level-buttons-computed',
    'ytd-menu-renderer.ytd-video-primary-info-renderer',
    '#actions-inner',
    'ytd-watch-metadata #actions',
  ];

  let container: HTMLElement | null = null;

  for (const selector of selectors) {
    container = document.querySelector(selector);
    if (container) break;
  }

  if (!container) {
    // Retry after a delay if container not found
    setTimeout(injectSummarizeButton, 2000);
    return;
  }

  // Check if button already exists
  if (document.getElementById('explainer-ai-btn')) {
    return;
  }

  // Create the button
  const button = document.createElement('button');
  button.id = 'explainer-ai-btn';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
    <span>Summarize</span>
  `;

  // Style the button to match YouTube's style
  button.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 16px;
    height: 36px;
    background: transparent;
    border: none;
    border-radius: 18px;
    color: #f1f1f1;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    margin-left: 8px;
  `;

  // Add hover effect
  button.addEventListener('mouseenter', () => {
    button.style.background = 'rgba(255, 255, 255, 0.1)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = 'transparent';
  });

  // Handle click
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentUrl = window.location.href;
    const parsed = parseUrl(currentUrl);

    if (parsed.type === 'youtube') {
      openSummarizer({
        url: currentUrl,
        type: 'youtube',
        autoStart: true,
      });
    }
  });

  // Insert into container
  container.appendChild(button);
}
