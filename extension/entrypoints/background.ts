import { openSummarizer, openDeepExplain } from '@/utils/redirect';

export default defineBackground(() => {
  // Create context menu items
  browser.runtime.onInstalled.addListener(() => {
    // Context menu for summarizing current page
    browser.contextMenus.create({
      id: 'summarize-page',
      title: '🤖 Summarize this page',
      contexts: ['page'],
    });

    // Context menu for selected text
    browser.contextMenus.create({
      id: 'explain-selection',
      title: '🧠 Explain selection',
      contexts: ['selection'],
    });

    // Context menu for links
    browser.contextMenus.create({
      id: 'summarize-link',
      title: '🤖 Summarize link',
      contexts: ['link'],
    });
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
      case 'summarize-page':
        if (tab?.url) {
          openSummarizer({
            url: tab.url,
            type: tab.url.includes('youtube.com') ? 'youtube' : 'web',
            autoStart: true,
          });
        }
        break;

      case 'explain-selection':
        if (info.selectionText) {
          openDeepExplain({
            text: info.selectionText,
            autoStart: true,
          });
        }
        break;

      case 'summarize-link':
        if (info.linkUrl) {
          openSummarizer({
            url: info.linkUrl,
            type: info.linkUrl.includes('youtube.com') ? 'youtube' : 'web',
            autoStart: true,
          });
        }
        break;
    }
  });
});
