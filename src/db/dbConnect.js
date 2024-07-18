import { MongoClient } from 'mongodb'
import SignupUnverified from 'db/models/signupUnverified-model'
import User from 'db/models/user-model'
import UnsharedDeals from 'db/models/unshared-deals'
const collectionsClassArray = [SignupUnverified, User, UnsharedDeals]
var db;
const connectDB = () => {
  const dbConnectionString = process.env.MONGO_URI;
  console.log("MongoURI", process.env.MONGO_URI)
  const dbName = process.env.MAIN_DB_NAME || "DbName"
  MongoClient.connect(dbConnectionString, {
    useUnifiedTopology: true
  })
    .then((client) => {
      db = client.db(dbName);
      console.log('mongoDB connected successfully');
      InitialiseAndCreateCollections()
    }).catch((err) => {
      console.log('mongoDB connection error:', err);
      process.exit(1);
    });
}

const getDB = () => {
  return db;
}

const InitialiseAndCreateCollections = async () => {
  const currentCollectionsInDb = ((await db.listCollections().toArray()).map(collectionItem => collectionItem.name))
  collectionsClassArray.forEach((collectionClassItem) => {
    const collectionObject = new collectionClassItem()
    if (currentCollectionsInDb.includes(collectionObject.collectionName)) {
      db.command({
        collMod: collectionObject.collectionName,
        validator: collectionObject.schema.validator,
        validationLevel: collectionObject.schema.validationLevel
      })
    } else {
      db.createCollection(collectionObject.collectionName, collectionObject.schema)
    }
    if (collectionObject.schema.uniqueFields) {
      db.collection(collectionObject.collectionName).createIndex(
        getTransformedUniqueFields(collectionObject.uniqueFields),
        { unique: true }
      )
    }
  })
}

const getTransformedUniqueFields = (uniqueFieldsArray) => {
  let obj = {}
  uniqueFieldsArray.forEach(fieldItem => {
    obj[fieldItem] = 1
  })
  return obj
}

export {
  getDB as db,
  connectDB as mongoDBConnect
};