import { MongoMemoryServerSingleton } from '../__server__/memory.server';

module.exports = async () => {
  await MongoMemoryServerSingleton.getInstance();
};
