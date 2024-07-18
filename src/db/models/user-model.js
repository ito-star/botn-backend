// import DbOperations from '../db_functions/DbOperations.js'

// const userSchema = {
//   validator: {
//     $jsonSchema: {
//       bsonType: "object",
//       required: ["email", "password", "financeCalculations"],
//       properties: {
//         email: {
//           bsonType: "string",
//           description: "must be an email and is required",
//           pattern: "^.+\@.+$",
//           unique: true
//         },
//         password: {
//           bsonType: "string",
//           description: "must be a string and is required"
//         },
//         financeCalculations: {
//           bsonType: "array",
//           description: "must be a string and is required",
//           items: {
//             bsonType: "object",
//           }

//         }
//       }
//     }
//   }
// }

// export const instance = new DbOperations("user");
// export default {
//   schema: userSchema,
//   // instance: instance
// }



import DbOperations from "db/db_functions/dbOperations.js"
export default class User {
  static instance
  collectionName = "User"

  schema = {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["email", "username"],
        properties: {
          email: {
            bsonType: "string",
            description: "must be an email and is required",
            pattern: "^.+\@.+$"
          },
          password: {
            bsonType: "string",
            description: "must be a string and is required"
          },
          username: {
            bsonType: "string"
          },
          financeCalculations: {
            bsonType: "array",
            description: "must be a string and is required",
            items: {
              bsonType: "object",
            }
          }
        }
      }
    },
    validationLevel: 'strict',

  }

  uniqueFields = ['email']

  constructor() {
    User.instance = new DbOperations(this.collectionName);
  }

}

