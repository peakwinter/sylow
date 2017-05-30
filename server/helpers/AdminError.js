import httpStatus from 'http-status';
import ExtendableError from './ExtendableError';

/**
 * Class representing an admin portal error.
 * @extends ExtendableError
 */
class AdminError extends ExtendableError {
  /**
   * Creates an admin portal error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message, status = httpStatus.INTERNAL_SERVER_ERROR, isPublic = false) {
    super(message, status, isPublic, 'html');
    this.name = 'AdminError';
  }
}

export default AdminError;
