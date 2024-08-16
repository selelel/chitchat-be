import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import 'dotenv/config';
import * as session from 'express-session';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 8080; // Default to 8080 if PORT is not defined

  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 5000000, maxFiles: 5 }),
  );

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'default_secret',
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalPipes(new ValidationPipe());
  
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(cookieParser());
  app.listen(port, '0.0.0.0', () => {
    Logger.log(`Server is running at http://localhost:${port}/graphql`);
  });

  app.use((req, res, next) => {
    console.log('Cookies:', req.cookies.refresh_token);
    next();
  });
}
bootstrap();
