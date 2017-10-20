import forge from 'node-forge';

const forgePki = forge.pki;
const forgeRsa = forge.pki.rsa;


function generateRsa(cb) {
  return forgeRsa.generateKeyPair({ bits: 2048, workers: -1 }, (err, keypair) => {
    if (err) {
      return cb(err);
    }

    return cb(null, {
      private: forgePki.privateKeyToPem(keypair.privateKey),
      public: forgePki.publicKeyToPem(keypair.publicKey)
    });
  });
}

function generateSignature(content, keypair, cb) {
  const md = forge.md.sha1.create();
  const privateKey = forgePki.privateKeyFromPem(keypair.private);
  md.update(content, 'utf8');
  const signature = privateKey.sign(md);
  return cb(null, signature, content);
}

function validateSignature(signature, data, keypair, cb) {
  const publicKey = forgePki.publicKeyFromPem(keypair.public);
  const verified = publicKey.verify(data, signature);
  return cb(null, verified);
}

function encryptData(keypair, data, method = 'RSAES-PKCS1-V1_5', cb) {
  if (typeof method === 'function') {
    cb = method;  // eslint-disable-line no-param-reassign
  }
  const publicKey = forgePki.publicKeyFromPem(keypair.public);
  const encrypted = publicKey.encrypt(data, method);
  return cb(null, encrypted);
}

function decryptData(keypair, data, method = 'RSAES-PKCS1-V1_5', cb) {
  if (typeof method === 'function') {
    cb = method;  // eslint-disable-line no-param-reassign
  }
  const privateKey = forgePki.privateKeyFromPem(keypair.private);
  const decrypted = privateKey.decrypt(data, method);
  return cb(null, decrypted);
}

export { generateRsa as default, generateSignature, validateSignature, encryptData, decryptData };
