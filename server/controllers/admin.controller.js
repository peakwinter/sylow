import httpStatus from 'http-status';

import AccessToken from '../models/accessToken.model';
import Client from '../models/client.model';
import Document from '../models/document.model';
import Entity from '../models/entity.model';

import config, { unvariableConfig } from '../../config/config';
import APIError from '../helpers/APIError';
import { randomStr } from '../utils/random';


export function index(req, res, next) {
  const docTypes = Document.aggregate([{ $sortByCount: '$contentType' }]);
  const [docCount, entityCount, clientCount] = [Document.count(), Entity.count(), Client.count()];

  Promise.all([docTypes, docCount, entityCount, clientCount])
    .then(([contentTypes, documents, entities, clients]) => res.render('index', {
      active: 'index', contentTypes, documents, entities, clients
    }))
    .catch(next);
}

export function showEntity(req, res) {
  return Promise.all([
    Entity.get(req.params.entityId), AccessToken.find({ entity: req.params.entityId }).populate('client')
  ])
    .then(([entity, tokens]) => res.render('entity', {
      ctrl: 'entity', active: 'entities', entity, tokens
    }))
    .catch((err) => {
      req.flash('error', err.toString());
      return res.redirect('/entities');
    });
}

export function listEntities(req, res) {
  return Entity.find({ authoritative: true }).sort({ username: 1 })
    .then(entities => res.render('entities', { ctrl: 'entity', active: 'entities', entities }))
    .catch((err) => {
      req.flash('error', err.toString());
      return res.render('entities', { ctrl: 'entity', active: 'entities', entities: [] });
    });
}

export function createEntity(req, res) {
  if (!req.body.username || !req.body.passwordHash || !req.body.passwordSalt) {
    req.flash('error', 'Missing values');
    return res.redirect('/entities');
  }

  const entity = new Entity({
    username: req.body.username,
    domain: req.body.domain || config.domain,
    passwordHash: req.body.passwordHash,
    passwordSalt: req.body.passwordSalt,
    authoritative: true,
    admin: req.body.admin
  });

  return entity.save()
    .then(() => {
      req.flash('success', 'Entity created');
      return res.redirect('/entities');
    })
    .catch((err) => {
      req.flash('error', err.toString());
      return res.redirect('/entities');
    });
}

export function updateEntity(req, res) {
  const data = {
    username: req.body.username,
    admin: req.body.admin
  };
  if (req.body.passwordHash && req.body.passwordSalt) {
    data.passwordHash = req.body.passwordHash;
    data.passwordSalt = req.body.passwordSalt;
  }

  return Entity.findByIdAndUpdate(req.params.entityId, { $set: data }, { new: true })
    .then((entity) => {
      req.flash('success', 'Entity updated');
      return res.redirect(`/entities/${entity._id}`);
    })
    .catch((err) => {
      req.flash('error', err.toString());
      return res.redirect('/entities');
    });
}

export function deleteEntity(req, res, next) {
  const _id = req.params.entityId;
  return Entity.remove({ _id })
    .then((entity) => {
      if (!entity || !entity.result.n) {
        const err = new APIError('Entity does not exist', httpStatus.NOT_FOUND, true);
        return next(err);
      }
      return res.sendStatus(httpStatus.NO_CONTENT);
    })
    .catch(next);
}

export function showClient(req, res) {
  return Client.get(req.params.clientId)
    .then(client => res.render('client', {
      ctrl: 'client', active: 'clients', client
    }))
    .catch((err) => {
      req.flash('error', err.toString());
      return res.redirect('/clients');
    });
}

export function listClients(req, res) {
  return Client.find().sort({ clientName: 1 })
    .then(clients => res.render('clients', { ctrl: 'client', active: 'clients', clients }))
    .catch((err) => {
      req.flash('error', err.toString());
      return res.render('clients', { ctrl: 'client', active: 'clients', clients: [] });
    });
}

export function createClient(req, res) {
  if (!req.body.clientId || !req.body.clientName || !req.body.redirectUri) {
    req.flash('error', 'Missing values');
    return res.redirect('/clients');
  }

  const client = new Client({
    clientId: req.body.clientId,
    clientName: req.body.clientName,
    clientSecret: randomStr(32),
    redirectUri: req.body.redirectUri,
    deviceType: req.body.deviceType,
    scope: req.body.scope
  });

  return client.save()
    .then(() => {
      req.flash('success', 'Client created');
      return res.redirect('/clients');
    })
    .catch((err) => {
      req.flash('error', err.toString());
      return res.redirect('/clients');
    });
}

export function updateClient(req, res) {
  const data = {
    clientId: req.body.clientId,
    clientName: req.body.clientName,
    redirectUri: req.body.redirectUri,
    deviceType: req.body.deviceType,
    scope: req.body.scope
  };

  return Client.findByIdAndUpdate(req.params.clientId, { $set: data }, { new: true })
    .then((client) => {
      req.flash('success', 'Client updated');
      return res.redirect(`/clients/${client._id}`);
    })
    .catch((err) => {
      req.flash('error', err.toString());
      return res.redirect('/clients');
    });
}

export function deleteClient(req, res, next) {
  const _id = req.params.clientId;
  return Client.remove({ _id })
    .then((client) => {
      if (!client || !client.result.n) {
        const err = new APIError('Client does not exist', httpStatus.NOT_FOUND, true);
        return next(err);
      }
      return res.sendStatus(httpStatus.NO_CONTENT);
    })
    .catch(next);
}

export function revokeToken(req, res, next) {
  return AccessToken.remove({ _id: req.params.tokenId })
    .then((tokens) => {
      if (!tokens || !tokens.result.n) {
        const err = new APIError('Tokens do not exist or client not associated', httpStatus.NOT_FOUND, true);
        return next(err);
      }
      return res.sendStatus(httpStatus.NO_CONTENT);
    })
    .catch(next);
}

export function listSettings(req, res) {
  const settableConfig = {};
  Object.keys(config).forEach((i) => {
    if (!unvariableConfig.includes(i)) {
      settableConfig[i] = config[i];
    }
  });
  return res.render('setting', { ctrl: 'setting', active: 'settings', settings: settableConfig });
}

export function updateSettings(req, res) {
  const datas = req.body;
  const schemaDomain = datas.schemaDomainWhitelist.filter(n => n !== '');
  datas.schemaDomainWhitelist = schemaDomain;
  const updatedConfig = Object.assign(config, datas); // eslint-disable-line no-unused-vars
  req.flash('success', 'Settings updated');
  return res.redirect('/settings');
}
