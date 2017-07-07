import fs from 'fs';
import path from 'path';
import uuidV4 from 'uuid/v4';
import httpStatus from 'http-status';

import APIError from '../helpers/APIError';
import config from '../../config/config';

const fileCodes = {};


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

export { authorizeFile, deauthorizeFile, createFile };
