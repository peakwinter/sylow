/* eslint-disable func-names */

export default function updatedPlugin(schema) {
  schema.add({ updated: { type: Date, default: Date.now } });

  schema.pre('save', function (next) {
    this.lastMod = new Date();
    next();
  });
}
