import fs from 'fs';
import path from 'path';
import multer from 'multer';
import uuidV4 from 'uuid/v4';
import httpStatus from 'http-status';

import config from '../../config/config';
import APIError from '../helpers/APIError';


const fileCodes = {};

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const fsOK = fs.F_OK !== undefined ? fs.F_OK : fs.constants.F_OK;
      const newPath = path.join(config.fileSystemPath, req.user.entity._id);
      fs.access(newPath, fsOK, (err) => {
        /* istanbul ignore else */
        if (err && err.code === 'ENOENT') {
          fs.mkdir(newPath, 0o760, (mkerr) => {
            /* istanbul ignore if */
            if (mkerr) {
              throw new APIError('File system error, path could not be created.');
            }
            cb(null, newPath);
          });
        } else if (err) {
          throw new APIError('File system error, path could not be accessed.');
        } else {
          cb(null, newPath);
        }
      });
    },
    filename(req, file, cb) {
      cb(null, req.params.fileCode);
    }
  })
}).single('file');


function authorizeFile(entity) {
  const code = uuidV4();
  const fileCode = {
    entityId: entity._id,
    generatedAt: new Date()
  };
  fileCodes[code] = fileCode;
  return code;
}

function isFileAuthorized(code) {
  return code in fileCodes;
}

function deauthorizeFile(code) {
  delete fileCodes[code];
}


function createFile(req, res) {
  const code = authorizeFile(req.user.entity._id);
  return res.json({ url: `/api/files/${req.user.entity._id}/${code}` });
}

function uploadFile(req, res, next) {
  if (!isFileAuthorized(req.params.fileCode)) {
    const err = new APIError('Upload not authorized', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  deauthorizeFile(req.params.fileCode);
  return upload(req, res, (err) => {
    /* istanbul ignore if */
    if (err) {
      next(err);
    }
    return res.sendStatus(200);
  });
}

export { authorizeFile, deauthorizeFile, createFile, uploadFile };
