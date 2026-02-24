/**
 * URL parsing utilities for detecting content types
 */

export type ContentType = 'youtube' | 'web' | 'pdf' | 'restricted' | 'unknown';

export interface ParsedUrl {
  url: string;
  type: ContentType;
  videoId?: string;
  isSupported: boolean;
}

// Restricted URLs that extensions cannot access
const RESTRICTED_PROTOCOLS = [
  'chrome:',
  'chrome-extension:',
  'about:',
  'edge:',
  'brave:',
  'moz-extension:',
  'opera:',
  'vivaldi:',
];

// YouTube URL patterns - more comprehensive
const YOUTUBE_PATTERNS = [
  // Standard watch page
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  // Embed URLs
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  // Legacy URLs
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  // Short URLs
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  // Shorts
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  // Live streams
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
];

/**
 * Parse a URL and determine its content type
 */
export function parseUrl(url: string): ParsedUrl {
  if (!url || typeof url !== 'string') {
    return { url: '', type: 'unknown', isSupported: false };
  }

  try {
    const urlObj = new URL(url);

    // Check for restricted protocols
    if (RESTRICTED_PROTOCOLS.includes(urlObj.protocol)) {
      return { url, type: 'restricted', isSupported: false };
    }

    // Check for YouTube
    for (const pattern of YOUTUBE_PATTERNS) {
      const match = url.match(pattern);
      if (match) {
        return {
          url,
          type: 'youtube',
          videoId: match[1],
          isSupported: true,
        };
      }
    }

    // Check for PDF
    if (urlObj.pathname.toLowerCase().endsWith('.pdf')) {
      return { url, type: 'pdf', isSupported: true };
    }

    // Check for valid HTTP/HTTPS
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      return { url, type: 'web', isSupported: true };
    }

    return { url, type: 'unknown', isSupported: false };
  } catch {
    return { url, type: 'unknown', isSupported: false };
  }
}

/**
 * Extract video ID from YouTube URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Validate YouTube URL and return detailed info
 */
export function validateYouTubeUrl(url: string): { isValid: boolean; videoId?: string; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url);
    
    // Check if it's a YouTube domain
    if (!['youtube.com', 'www.youtube.com', 'youtu.be'].includes(urlObj.hostname)) {
      return { isValid: false, error: 'Not a YouTube URL' };
    }

    // Extract video ID
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return { isValid: false, error: 'No valid YouTube video ID found' };
    }

    // Validate video ID format (11 characters)
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return { isValid: false, error: 'Invalid YouTube video ID format' };
    }

    return { isValid: true, videoId };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Check if URL is a YouTube watch page
 */
export function isYouTubeWatchPage(url: string): boolean {
  return url.includes('youtube.com/watch') || url.includes('youtu.be/');
}

/**
 * Check if URL is a YouTube non-video page (homepage, channel, etc.)
 */
export function isYouTubeNonVideoPage(url: string): boolean {
  try {
    const urlObj = new URL(url);
    if (!['youtube.com', 'www.youtube.com'].includes(urlObj.hostname)) {
      return false;
    }
    
    // Check if it's NOT a video page
    const isVideoPage = isYouTubeWatchPage(url) || 
                       url.includes('/embed/') || 
                       url.includes('/shorts/') || 
                       url.includes('/v/') || 
                       url.includes('/live/');
    
    return !isVideoPage;
  } catch {
    return false;
  }
}

/**
 * Validate web URL and check if it's suitable for summarization
 */
export function validateWebUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are supported' };
    }

    // Check for YouTube non-video pages
    if (isYouTubeNonVideoPage(url)) {
      return { 
        isValid: false, 
        error: 'YouTube homepage and channels are not supported. Please use a specific video URL.' 
      };
    }

    // Check for restricted domains
    const restrictedDomains = ['chrome.google.com', 'addons.mozilla.org'];
    if (restrictedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return { isValid: false, error: 'This type of website is not supported' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Get a display-friendly shortened URL
 */
export function getShortUrl(url: string, maxLength: number = 50): string {
  try {
    const urlObj = new URL(url);
    const display = urlObj.hostname + urlObj.pathname;
    if (display.length <= maxLength) {
      return display;
    }
    return display.substring(0, maxLength - 3) + '...';
  } catch {
    return url.substring(0, maxLength);
  }
}
