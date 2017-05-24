import snakeCase from 'lodash.snakecase';

export default function (obj) {
  const snakeCased = {};
  Object.keys(obj).forEach((key) => {
    snakeCased[snakeCase(key)] = obj[key];
  });
  return snakeCased;
}
