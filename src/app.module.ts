import { MiddlewareConsumer, Module, NestModule, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { GatewayModule } from './gateway/gateway.module';
import { PostModule } from './post/post.module';
import { UtilModules } from './utils/utils_modules/utils.module';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { HttpModule } from '@nestjs/axios';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    UserModule,
    GatewayModule,
    PostModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule.register({ session: true }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/utils/schema.gql'),
      context: ({ req, res }) => ({ req, res }),
      cors: { origin: 'http://localhost:3000' , credentials: true },
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    UtilModules,
    HttpModule
  ],
  providers:[ConfigService],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser()) // Ensure this line is present
      .forRoutes('*');
  }
}
