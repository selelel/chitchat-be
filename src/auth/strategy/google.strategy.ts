import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { PassportProfile } from '../dto/google_payload.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject("AuthService") private readonly authService: AuthService) {
        super({
            clientID: process.env.OAUTH_GOOGLE_CLIENT_ID,
            clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['email', 'profile', 'openid'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: PassportProfile, done: VerifyCallback) {
        console.log(accessToken, refreshToken);
      const {emails, displayName, _json:{ given_name, family_name, picture}} = profile
      const payload_details = { email: emails[0].value, displayName, given_name, family_name, picture}
      const validate_create = await this.authService.validateGoogleLogInUser(payload_details)
      console.log(validate_create);
      done(null, profile);
    }
}