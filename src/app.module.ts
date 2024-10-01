import { Module, } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
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
      cors: {
        credentials: 'include',
        mode: 'cors',
        origin: true,
      },
      context: ({ req, res }) => ({ req, res })
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: process.env.DB_URI,
      }),
    }),
    UtilModules,
    HttpModule
  ],
  providers:[ConfigService],
  controllers: [AppController],
})
export class AppModule{}
