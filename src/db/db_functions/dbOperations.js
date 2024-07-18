
export default class DbOperations {

  constructor(collectionName) {
    (async () => {
      let { db } = await import('../dbConnect.js')
      this.collectionName = collectionName;
      this.db = db;
    })()
  }

  insertOne(...args) {
    console.log(...args)
    return this.db().collection(this.collectionName).insertOne(...args);
  }

  // insertMany(dataArrayToInsert) {
  //   return this.db().collection(this.collectionName).insertMany(dataArrayToInsert);
  // }


  findOne(query) {
    return this.db().collection(this.collectionName).findOne(query);
  }

  findOneAndDelete(...params) {
    return this.db().collection(this.collectionName).findOneAndDelete(...params)
  }

  findOneAndUpdate(...params) {
    // console.log(...params)
    return this.db().collection(this.collectionName).findOneAndUpdate(...params)
  }

  find(query) {
    return this.db().collection(this.collectionName).find(query);
  }

  updateOne(...params) {
    return this.db().collection(this.collectionName).updateOne(...params)
  }

  // find(query) {
  //   console.log("Find");
  //   return this.db().collection(this.collectionName).find(query).toArray();
  // }

  // updateOne(query, dataToUpdate) {
  //   return this.db().collection(this.collectionName).updateOne(query, { $set: dataToUpdate })
  // }

  // update(query, dataToUpdate) {
  //   console.log("query:    ", query);
  //   return this.db().collection(this.collectionName).update(query, { $set: dataToUpdate }, { upsert: true })
  // }

  deleteOne(query) {
    return this.db().collection(this.collectionName).deleteOne(query);
  }

  // deleteOneById(_id) {
  //   return this.db().collection(this.collectionName).deleteOne({ _id: new require('mongodb').ObjectID(_id) })
  // }

  // drop() {
  //   return this.db().collection(this.collectionName).drop();
  // }
}
