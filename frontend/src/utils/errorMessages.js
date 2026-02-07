/**
 * Translates technical error messages to user-friendly messages
 * Maps common backend/API errors to readable text
 */

const errorMappings = {
  // Network errors
  'network error': 'Unable to connect. Please check your internet connection.',
  'failed to fetch': 'Unable to connect. Please check your internet connection.',
  'econnrefused': 'Server is temporarily unavailable. Please try again later.',
  'econnreset': 'Connection was interrupted. Please try again.',
  'timeout': 'Request timed out. Please try again.',
  
  // Authentication errors
  'invalid token': 'Your session has expired. Please log in again.',
  'jwt expired': 'Your session has expired. Please log in again.',
  'unauthorized': 'You need to log in to access this.',
  'not authorized': 'You don\'t have permission to do this.',
  
  // Credit errors
  'insufficient credits': 'Not enough credits. Please upgrade your plan or wait for monthly reset.',
  'credit limit exceeded': 'You\'ve reached your credit limit this month.',
  
  // Rate limiting
  'rate limit': 'Too many requests. Please wait a moment and try again.',
  'too many requests': 'Too many requests. Please wait a moment and try again.',
  
  // Content errors
  'invalid url': 'Please enter a valid URL.',
  'url not found': 'Could not access that URL. Please check if it\'s correct.',
  'content too long': 'The content is too long to process.',
  'no transcript': 'This video doesn\'t have subtitles/transcripts available.',
  'video unavailable': 'This video is unavailable or private.',
  
  // AI/Generation errors
  'generation failed': 'Failed to generate content. Please try again.',
  'deepgram': 'Audio generation failed. Please try again.',
  'gemini': 'AI processing failed. Please try again.',
  'openrouter': 'AI processing failed. Please try again.',
  
  // File errors
  'file too large': 'File is too large. Please use a smaller file.',
  'invalid file type': 'This file type is not supported.',
  
  // General
  'internal server error': 'Something went wrong. Please try again later.',
  'server error': 'Something went wrong. Please try again later.',
};

/**
 * Get a user-friendly error message from a technical error
 * @param {Error|string} error - The error object or message
 * @returns {string} User-friendly error message
 */
export function getFriendlyErrorMessage(error) {
  // Extract message from error object or use string directly
  let message = '';
  
  if (typeof error === 'string') {
    message = error;
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  } else {
    return 'Something went wrong. Please try again.';
  }
  
  const lowerMessage = message.toLowerCase();
  
  // Check for matching error patterns
  for (const [pattern, friendlyMessage] of Object.entries(errorMappings)) {
    if (lowerMessage.includes(pattern)) {
      return friendlyMessage;
    }
  }
  
  // If the message is already user-friendly (short and doesn't have technical terms)
  if (message.length < 100 && !lowerMessage.includes('error:') && !lowerMessage.includes('exception')) {
    // Capitalize first letter and ensure it ends with period
    let cleaned = message.charAt(0).toUpperCase() + message.slice(1);
    if (!cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
      cleaned += '.';
    }
    return cleaned;
  }
  
  // Default fallback
  return 'Something went wrong. Please try again.';
}

/**
 * Show a user-friendly error toast
 * @param {import('sonner').toast} toast - The toast function from sonner
 * @param {Error|string} error - The error object or message
 */
export function showErrorToast(toast, error) {
  toast.error(getFriendlyErrorMessage(error));
}

export default getFriendlyErrorMessage;
