/**
 * Translates technical error messages to user-friendly messages.
 * Handles network failures, DB down, API errors, and all edge cases.
 */

const errorMappings = [
  // ── Network / connectivity ─────────────────────────────
  { match: 'network error',        msg: 'Unable to reach the server. Please check your internet connection.' },
  { match: 'failed to fetch',      msg: 'Unable to reach the server. Please check your internet connection.' },
  { match: 'econnrefused',         msg: 'Server is currently unavailable. Please try again in a moment.' },
  { match: 'econnreset',           msg: 'Connection was interrupted. Please try again.' },
  { match: 'etimedout',            msg: 'Request timed out. Please try again.' },
  { match: 'timeout',              msg: 'This is taking too long. Please try again.' },
  { match: 'certificate',          msg: 'Secure connection failed. Please try again.' },
  { match: 'err_network',          msg: 'Unable to reach the server. Please check your internet connection.' },
  { match: 'err_internet',         msg: 'No internet connection. Please check your network.' },

  // ── Auth errors ────────────────────────────────────────
  { match: 'invalid token',        msg: 'Your session has expired. Please log in again.' },
  { match: 'jwt expired',          msg: 'Your session has expired. Please log in again.' },
  { match: 'token expired',        msg: 'Your session has expired. Please log in again.' },
  { match: 'invalid credentials',  msg: 'Incorrect email or password.' },
  { match: 'invalid password',     msg: 'Incorrect email or password.' },
  { match: 'user not found',       msg: 'No account found with that email.' },
  { match: 'already exists',       msg: 'An account with this email already exists.' },
  { match: 'email already',        msg: 'An account with this email already exists.' },
  { match: 'unauthorized',         msg: 'You need to log in to access this.' },
  { match: 'not authorized',       msg: 'You don\'t have permission to do this.' },
  { match: 'forbidden',            msg: 'You don\'t have permission to do this.' },
  { match: 'github',               msg: 'GitHub login failed. Please try again.' },

  // ── Credit errors ──────────────────────────────────────
  { match: 'insufficient credits', msg: 'You\'ve run out of credits. Upgrade your plan or wait for the monthly reset.' },
  { match: 'credit limit',         msg: 'You\'ve reached your credit limit this month.' },
  { match: 'not enough credits',   msg: 'You\'ve run out of credits. Upgrade your plan or wait for the monthly reset.' },

  // ── Rate limiting ──────────────────────────────────────
  { match: 'too many requests',    msg: 'You\'re going too fast. Please wait a moment and try again.' },
  { match: 'rate limit',           msg: 'Too many attempts. Please wait a moment and try again.' },

  // ── Content / URL errors ───────────────────────────────
  { match: 'invalid url',          msg: 'Please enter a valid URL.' },
  { match: 'url not found',        msg: 'Could not access that URL. Please check that it\'s correct and publicly accessible.' },
  { match: 'could not access',     msg: 'Could not access that page. It may be private or require login.' },
  { match: 'content too long',     msg: 'The content is too long to process. Please try a shorter version.' },
  { match: 'too little text',      msg: 'The content is too short to summarize (minimum 100 characters).' },
  { match: 'no transcript',        msg: 'This video doesn\'t have captions or transcripts available.' },
  { match: 'video unavailable',    msg: 'This video is unavailable or set to private.' },
  { match: 'private video',        msg: 'This video is private and cannot be accessed.' },
  { match: 'invalid youtube',      msg: 'Please enter a valid YouTube video URL.' },

  // ── File errors ────────────────────────────────────────
  { match: 'file too large',       msg: 'File is too large. Maximum size is 10MB.' },
  { match: 'invalid file type',    msg: 'This file type is not supported. Please use a PDF.' },
  { match: 'pdf contains',         msg: 'The PDF appears to be empty or image-only (no selectable text).' },

  // ── AI / generation errors ─────────────────────────────
  { match: 'deepgram',             msg: 'Audio generation failed. Please try again.' },
  { match: 'gemini',               msg: 'AI processing failed. Please try again.' },
  { match: 'openrouter',           msg: 'AI processing failed. Please try again.' },
  { match: 'openai',               msg: 'AI processing failed. Please try again.' },
  { match: 'generation failed',    msg: 'Failed to generate content. Please try again.' },
  { match: 'empty response',       msg: 'The AI returned an empty response. Please try again.' },
  { match: 'firecrawl',            msg: 'Could not scrape that page. It may block automated access.' },

  // ── Database / server errors ───────────────────────────
  { match: 'prisma',               msg: 'A database error occurred. Please try again.' },
  { match: 'database',             msg: 'A database error occurred. Please try again.' },
  { match: 'internal server',      msg: 'Something went wrong on our end. Please try again.' },
  { match: 'server error',         msg: 'Something went wrong on our end. Please try again.' },
  { match: 'service unavailable',  msg: 'Service is temporarily unavailable. Please try again in a moment.' },
];

/**
 * Get a user-friendly error message from a technical error.
 * Accepts Error objects, axios errors, or plain strings.
 */
export function getFriendlyErrorMessage(error) {
  // No error at all
  if (!error) return 'Something went wrong. Please try again.';

  // Axios / fetch network failure (no response received)
  if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED' ||
      error?.message === 'Network Error') {
    return 'Unable to reach the server. Please check your internet connection.';
  }

  // Extract the message string to test against
  let message = '';
  if (typeof error === 'string') {
    message = error;
  } else if (error?.response?.data?.message) {
    // Axios error with server response body
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  } else {
    return 'Something went wrong. Please try again.';
  }

  const lower = message.toLowerCase();

  for (const { match, msg } of errorMappings) {
    if (lower.includes(match)) return msg;
  }

  // Already user-friendly: short, no technical jargon
  if (
    message.length < 120 &&
    !lower.includes('error:') &&
    !lower.includes('exception') &&
    !lower.includes('stack') &&
    !lower.includes('at ') // stack trace lines
  ) {
    let cleaned = message.charAt(0).toUpperCase() + message.slice(1);
    if (!/[.!?]$/.test(cleaned)) cleaned += '.';
    return cleaned;
  }

  return 'Something went wrong. Please try again.';
}

export default getFriendlyErrorMessage;
