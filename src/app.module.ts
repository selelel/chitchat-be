import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    UserModule,
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/core/schema.gql'),
    }),
    MongooseModule.forRoot(process.env.DB_URI),
  ],
  providers: [],
})
export class AppModule {}
