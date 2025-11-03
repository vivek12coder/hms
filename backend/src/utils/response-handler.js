/**
 * Standardized API Response Handler
 * Ensures consistent response format across all API endpoints
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} pagination - Pagination metadata (optional)
 */
function successResponse(res, data, message = 'Success', statusCode = 200, pagination = null) {
  const response = {
    success: true,
    message,
    data
  };

  if (pagination) {
    response.pagination = {
      total: pagination.total || 0,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
    };
  }

  return res.status(statusCode).json(response);
}

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Object} errors - Validation errors (optional)
 * @param {string} errorCode - Application-specific error code (optional)
 */
function errorResponse(res, message = 'An error occurred', statusCode = 500, errors = null, errorCode = null) {
  const response = {
    success: false,
    message,
    error: {
      code: errorCode || `ERROR_${statusCode}`,
      message
    }
  };

  // Add validation errors if present
  if (errors && Array.isArray(errors)) {
    response.error.details = errors;
  }

  // Add timestamp
  response.timestamp = new Date().toISOString();

  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development' && errors?.stack) {
    response.error.stack = errors.stack;
  }

  return res.status(statusCode).json(response);
}

/**
 * Created response (201)
 */
function createdResponse(res, data, message = 'Resource created successfully') {
  return successResponse(res, data, message, 201);
}

/**
 * No content response (204)
 */
function noContentResponse(res) {
  return res.status(204).send();
}

/**
 * Bad request response (400)
 */
function badRequestResponse(res, message = 'Bad request', errors = null) {
  return errorResponse(res, message, 400, errors, 'BAD_REQUEST');
}

/**
 * Unauthorized response (401)
 */
function unauthorizedResponse(res, message = 'Unauthorized') {
  return errorResponse(res, message, 401, null, 'UNAUTHORIZED');
}

/**
 * Forbidden response (403)
 */
function forbiddenResponse(res, message = 'Forbidden') {
  return errorResponse(res, message, 403, null, 'FORBIDDEN');
}

/**
 * Not found response (404)
 */
function notFoundResponse(res, message = 'Resource not found') {
  return errorResponse(res, message, 404, null, 'NOT_FOUND');
}

/**
 * Conflict response (409)
 */
function conflictResponse(res, message = 'Resource already exists') {
  return errorResponse(res, message, 409, null, 'CONFLICT');
}

/**
 * Unprocessable entity response (422)
 */
function validationErrorResponse(res, errors, message = 'Validation failed') {
  return errorResponse(res, message, 422, errors, 'VALIDATION_ERROR');
}

/**
 * Internal server error response (500)
 */
function internalServerErrorResponse(res, message = 'Internal server error') {
  return errorResponse(res, message, 500, null, 'INTERNAL_SERVER_ERROR');
}

/**
 * Service unavailable response (503)
 */
function serviceUnavailableResponse(res, message = 'Service temporarily unavailable') {
  return errorResponse(res, message, 503, null, 'SERVICE_UNAVAILABLE');
}

/**
 * Too many requests response (429)
 */
function tooManyRequestsResponse(res, message = 'Too many requests', retryAfter = null) {
  if (retryAfter) {
    res.setHeader('Retry-After', retryAfter);
  }
  return errorResponse(res, message, 429, null, 'TOO_MANY_REQUESTS');
}

/**
 * Paginated response helper
 */
function paginatedResponse(res, data, total, page, limit, message = 'Success') {
  return successResponse(res, data, message, 200, { total, page, limit });
}

module.exports = {
  successResponse,
  errorResponse,
  createdResponse,
  noContentResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  validationErrorResponse,
  internalServerErrorResponse,
  serviceUnavailableResponse,
  tooManyRequestsResponse,
  paginatedResponse
};
