import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from './auth.local.strategy';
import { UserModule } from 'src/user/user.module';
import { AuthResolver } from './auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/dto/user.entity';

@Module({
  imports: [PassportModule, UserModule, TypeOrmModule.forFeature([User])],
  providers: [AuthService, LocalStrategy, AuthResolver],
})
export class AuthModule {}
