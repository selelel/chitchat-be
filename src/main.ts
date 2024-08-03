import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import 'dotenv/config';
import { assert } from 'node:console';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;
  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 5000000, maxFiles: 5 }),
  );
  app.use(
    session({
      secret: '_selelel',
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.listen(port, '0.0.0.0', () => {
    assert(`Server is running at http://localhost:${port}/graphql`);
  });
}
bootstrap();
