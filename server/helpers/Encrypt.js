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
  const privateKey = forgePki.privateKeyfromPem(keypair.private);
  md.update(content, 'utf8');
  const signature = privateKey.sign(md);
  return cb(null, signature, content);
}

export { generateRsa as default, generateSignature };
