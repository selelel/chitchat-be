import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { Module } from '@nestjs/common';
import { GatewayModule } from './gateway/gateway.module';
import { PostResolver } from './post/post.resolver';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    UserModule,
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/utils/schema.gql'),
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    GatewayModule,
    PostModule,
  ],
  providers: [PostResolver],
})
export class AppModule {}
