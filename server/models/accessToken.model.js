import mongoose from 'mongoose';

import createdPlugin from './plugins/created';
import uuidRegex from '../utils/uuid';

/**
 * Access Token Storage Schema
 */
const AccessTokenSchema = new mongoose.Schema({
  tokenType: {
    type: String,
    enum: ['access', 'refresh'],
    default: 'access'
  },
  entity: {
    type: String,
    match: [uuidRegex, 'The value of path {PATH} ({VALUE}) is not a valid UUID.'],
    ref: 'Entity'
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Client'
  },
  token: {
    type: String,
    required: true
  },
  scope: String,
  expiresAt: Date
});
AccessTokenSchema.plugin(createdPlugin);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
AccessTokenSchema.method({
});

/**
 * @typedef Entity
 */
export default mongoose.model('AccessToken', AccessTokenSchema);
