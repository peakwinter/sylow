import uuidV4 from 'uuid/v4';

import Device from '../models/device.model';

/**
 * Load device and append to req.
 */
function load(req, res, next, id) {
  Device.get(id)
    .then((device) => {
      req.device = device; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get device
 */
function get(req, res) {
  return res.json(req.device);
}

/**
 * Create new device
 * @property {string} req.body.entityId - The id of the related entity.
 * @property {string} req.body.deviceName - The name of the device.
 * @property {string} req.body.deviceType - The type of the device.
 * @returns {Device}
 */
function create(req, res, next) {
  const device = new Device({
    id: uuidV4(),
    entityId: req.body.entityId,
    deviceName: req.body.deviceName,
    deviceType: req.body.deviceType,
  });

  device.save()
    .then(savedDevice => res.json(savedDevice))
    .catch(e => next(e));
}

/**
 * Update existing device
 * @property {string} req.body.entityId - The id of the related entity.
 * @property {string} req.body.deviceName - The name of the device.
 * @property {string} req.body.deviceType - The type of the device.
 * @returns {Device}
 */
function update(req, res, next) {
  const device = req.device;
  device.entityId = req.body.entityId;
  device.deviceName = req.body.deviceName;
  device.deviceType = req.body.deviceType;

  device.save()
    .then(savedDevice => res.json(savedDevice))
    .catch(e => next(e));
}


/**
 * Get device list.
 * @property {number} req.query.skip - Number of devices to be skipped.
 * @property {number} req.query.limit - Limit number of devices to be returned.
 * @return {Device}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Device.list({ limit, skip })
    .then(devices => res.json(devices))
    .catch(e => next(e));
}

/**
 * Delete device.
 * @return {Device}
 */
function remove(req, res, next) {
  const device = req.device;
  device.remove()
    .then(deletedDevice => res.json(deletedDevice))
    .catch(e => next(e));
}

export default { load, get, list, create, update, remove };
