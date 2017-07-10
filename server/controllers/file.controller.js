import fs from 'fs';
import path from 'path';
import multer from 'multer';
import uuidV4 from 'uuid/v4';

import config from '../../config/config';

const fileCodes = {};


function createMulterStorage() {
  return multer.diskStorage({
    destination(req, file, cb) {
      cb(null, path.join(config.fileSystemPath, req.user.entity._id));
    },
    filename(req, file, cb) {
      cb(null, uuidV4());
    }
  });
}

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
  return res.json({ url: `https://${config.domain}/${req.user.entity._id}/${code}` });
}

function uploadFileComplete(req, res) {
  deauthorizeFile(req.params.fileCode);
  return res.sendStatus(200);
}

export { createMulterStorage, authorizeFile, deauthorizeFile, createFile, uploadFileComplete };
