import DbOperations from "db/db_functions/dbOperations.js"
export default class SignupUnverified {
  static instance
  collectionName = 'SignupUnverified'
  schema = {
    validator: {
      '$jsonSchema': {
        bsonType: "object",
        required: ["email", "password", "verificationString", "timestamp", "username"],
        properties: {
          email: {
            bsonType: "string",
            description: "must be an email and is required",
            pattern: "^.+\@.+$",
            // unique: true
          },
          password: {
            bsonType: "string",
            description: "must be a string and is required"
          },
          verificationString: {
            bsonType: "string",
            description: "must be a string and is required"
          },
          username: {
            bsonType: "string",
            description: "must be a string and is required"
          }
        }
      }
    },
    validationLevel: 'strict'
  }

  constructor() {
    SignupUnverified.instance = new DbOperations(this.collectionName);
  }
}

