import fs from 'fs';
import path from 'path';
import multer from 'multer';
import uuidV4 from 'uuid/v4';

import config from '../../config/config';
import APIError from '../helpers/APIError';


const fileCodes = {};

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const newPath = path.join(config.fileSystemPath, req.user.entity._id);
      fs.access(newPath, fs.constants.F_OK, (err) => {
        if (err && err.code === 'ENOENT') {
          fs.mkdir(newPath, 0o760, (mkerr) => {
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

function deauthorizeFile(code, remove = false) {
  if (code in fileCodes) {
    const fileData = fileCodes[code];
    delete fileCodes[code];

    if (remove) {
      const fullPath = path.join(config.fileSystemPath, fileData.entityId, code);
      fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlinkSync(fullPath);
        }
      });
    }
  }
}


function createFile(req, res) {
  const code = authorizeFile(req.user.entity._id);
  return res.json({ url: `/api/files/${req.user.entity._id}/${code}` });
}

function uploadFile(req, res, next) {
  deauthorizeFile(req.params.fileCode);
  upload(req, res, (err) => {
    if (err) {
      next(err);
    }
    return res.sendStatus(200);
  });
}

export { authorizeFile, deauthorizeFile, createFile, uploadFile };
