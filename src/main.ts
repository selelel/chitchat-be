import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import 'dotenv/config';
import * as session from 'express-session';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';
import { SESSION_SECRET } from './utils/constant/constant';

const startServer = async () => {
  try {
    const app = await NestFactory.create(AppModule);

    const port = process.env.PORT || 5000;
    app.use(
      '/graphql',
      graphqlUploadExpress({ maxFileSize: 5000000, maxFiles: 5 }),
    );

    app.use(
      session({
        secret: SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: {
          maxAge: 60000,
        },
      }),
    );

    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(passport.session());
    app.useGlobalPipes(new ValidationPipe());

    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
    });

    await app.listen(port as number, '0.0.0.0');
    Logger.log(`Server listening on ${port} http://localhost:${port}/graphql`);
  } catch (err) {
    Logger.error(err);
  }
};

startServer();
