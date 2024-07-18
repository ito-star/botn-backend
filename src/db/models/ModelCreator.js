export default class ModelCreator {
  constructor(DefinedClass) {
    DefinedClass.instance = new DbOperations(DefinedClass.collectionName, DefinedClass.schema);
  }
}