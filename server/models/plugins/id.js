import uuidV4 from 'uuid/v4';
import uuidRegex from '../../utils/uuid';


export default function idPlugin(schema) {
  schema.add({
    _id: {
      type: String,
      required: true,
      default: uuidV4,
      match: [uuidRegex, 'The value of path {PATH} ({VALUE}) is not a valid UUID.']
    }
  });
}
