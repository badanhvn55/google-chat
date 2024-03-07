import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';
import { FacebookStrategy } from './facebook.strategy';

@Module({
    imports: [PassportModule],
    providers: [AuthService, GoogleStrategy, FacebookStrategy],
    controllers: [AuthController],
})
export class AuthModule {}
