import { MongoMemoryServer } from 'mongodb-memory-server';

class MongoMemoryServerSingleton {
  private static instance: MongoMemoryServer;
  private static uri: string;

  private constructor() {}

  public static async getInstance(): Promise<string> {
    if (!MongoMemoryServerSingleton.instance) {
      MongoMemoryServerSingleton.instance = await MongoMemoryServer.create();
      MongoMemoryServerSingleton.uri =
        MongoMemoryServerSingleton.instance.getUri();
    }
    return MongoMemoryServerSingleton.uri;
  }

  public static async stopInstance(): Promise<void> {
    if (MongoMemoryServerSingleton.instance) {
      await MongoMemoryServerSingleton.instance.stop();
      MongoMemoryServerSingleton.instance = null;
    }
  }
}

export { MongoMemoryServerSingleton };
