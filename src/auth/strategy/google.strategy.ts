import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { PassportProfile } from '../dto/google_payload.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AuthService') private readonly authService: AuthService,
  ) {
    super({
      clientID: process.env.OAUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile', 'openid'],
      accessType: 'offline', // Ensure offline access to get a refresh token
      prompt: 'consent', // Ask for user consent each time to get a refresh token
    });
  }

  // PLEASE RE-INTEGRATE OAUTH
  // ! Google OAuth Integration is full of drawbacks.
  // ! Note for need to take into serious considerations.
  async validate(
    _accesstoken: string,
    _refreshtoken: string,
    profile: PassportProfile,
    done: VerifyCallback,
  ) {
    const {
      emails,
      displayName,
      _json: { given_name, family_name, picture },
    } = profile;

    const payload_details = {
      email: emails[0].value,
      displayName,
      given_name,
      family_name,
      picture,
    };
    const user = await this.authService.validateGoogleLogInUser(
      payload_details,
      _accesstoken,
    );

    const refresh_token = await this.authService.createRefreshToken(
      user._id,
      'google',
    );

    const decoded_token = await this.authService.decodeToken(refresh_token);
    done(null, {
      ...profile,
      refresh_token,
      decoded_token,
      google_accesstoken: _accesstoken,
      user,
    });
  }
}
