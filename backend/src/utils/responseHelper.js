/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {object} data - Data to send
 * @param {string} [message] - Optional message
 * @param {number} [status=200] - HTTP status code
 */
export const successResponse = (res, data, message, status = 200) => {
  res.status(status).json({
    success: true,
    data,
    message,
  });
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} [status=400] - HTTP status code
 * @param {object} [error] - Error details (optional, for debugging)
 */
export const errorResponse = (res, message, status = 400, error = null) => {
  const response = {
    success: false,
    message,
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message || error;
  }

  res.status(status).json(response);
};
