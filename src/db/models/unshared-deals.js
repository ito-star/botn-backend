import DbOperations from "db/db_functions/dbOperations.js"
export default class UnsharedDeals {
  static instance
  collectionName = 'UnsharedDeals'
  schema = {
    validator: {
      '$jsonSchema': {
        bsonType: "object",
        required: ["email", "deals"],
        properties: {
          email: {
            bsonType: "string",
            description: "must be an email and is required",
            pattern: "^.+\@.+$",
            // unique: true
          },
          deals: {

          }
        }
      }
    },
    validationLevel: 'strict'
  }

  constructor() {
    UnsharedDeals.instance = new DbOperations(this.collectionName);
  }
}

