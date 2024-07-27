import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/utils/schema.gql'),
      context: ({ req, res }) => ({ req, res }),}),
    MongooseModule.forRoot(process.env.DB_URI),
    UtilModules,
  ],
})
export class AppModule {}
