export const DEFAULTS = {
  CREDIT_LIMIT: 10,
  USAGE_RESET_DAYS: 30,
  PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },
  SUMMARY: {
    CHAR_LIMITS: {
      quick: 500,
      standard: 1500,
      detailed: 3000,
    },
  },
  PODCAST: {
    CHAR_LIMITS: {
      quick: 2000,
      standard: 3500,
      detailed: 6000,
    },
  },
  STORAGE: {
    BUCKET_AUDIO: 'audio',
    EXT_WAV: '.wav',
  },
  PREFERENCES: {
    READING_LEVELS: ['beginner', 'intermediate', 'expert'],
    TONES: ['casual', 'conversational', 'professional', 'academic'],
    DEPTHS: ['quick', 'standard', 'detailed'],
  },
};
