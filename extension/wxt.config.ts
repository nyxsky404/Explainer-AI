import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Explainer-AI',
    description: 'AI-powered summarization and explanation workspace',
    permissions: ['activeTab', 'storage', 'contextMenus', 'scripting'],
    host_permissions: ['*://*.youtube.com/*', '*://youtu.be/*', '*://*/*'],
    action: {
      default_title: 'Open Explainer-AI Sidebar',
    },
    side_panel: {
      default_title: 'Explainer-AI',
    },
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Ctrl+Shift+E',
          mac: 'Command+Shift+E',
        },
        description: 'Open Explainer-AI Sidebar',
      },
      open_sidebar: {
        suggested_key: {
          default: 'Ctrl+Shift+S',
          mac: 'Command+Shift+S',
        },
        description: 'Open Explainer-AI Sidebar',
      },
    },
  },
});
