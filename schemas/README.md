## Sylow Schemas

This folder holds current schema definitions in the JSON Schema format. These schemas can be used for validating incoming documents received from another Sylow server.

Note that these schemas describe how data is exchanged between servers *after decryption* and not necessarily how they are stored in the database.

1. Document is received
2. Encryptable/encodable elements of the document (except embedded binaries) are decrypted and decoded
3. Document is validated against the appropriate JSON Schemas
4. Document is transformed into the necessary format for database storage, if storage is necessary
5. Document is stored, if storage is necessary

To allow the processing of non-standard document types hosted on other domains, make sure to add the domain they are hosted on to the `SY_SCHEMA_DOMAIN_WHITELIST` environment variable (colon-separated).
