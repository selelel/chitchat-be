import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import 'dotenv/config'; 
import { assert } from "node:console"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;
  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 5000000, maxFiles: 5 }),
  );
  app.listen(port, '0.0.0.0', () => {
    assert(`Server is running at http://localhost:${port}/graphql`);
  });
}
bootstrap();
