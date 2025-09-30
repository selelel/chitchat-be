import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import 'dotenv/config';
import * as session from 'express-session';
import * as passport from 'passport';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SESSION_SECRET } from './utils/constant/constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 5000;

  // GraphQL Upload middleware
  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 5_000_000, maxFiles: 5 }),
  );

  // Session
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

  // Middleware
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalPipes(new ValidationPipe());

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://chitchat-be-rhrm.onrender.com',
      
    ],
    credentials: true,
  });

  await app.listen(port as number, '0.0.0.0');
  Logger.log(`🚀 Server running at http://0.0.0.0:${port}/graphql`);
}

bootstrap();