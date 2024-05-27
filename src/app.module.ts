import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/core/schema.gql'),
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.DB_URI,
      entities: [join(__dirname, '**/**.entity{.ts,.js}')],
    }),
    AuthModule,
    ChatModule,
  ],
  providers: [AuthService],
})
export class AppModule {}
