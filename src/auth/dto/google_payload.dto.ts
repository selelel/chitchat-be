import { Profile } from 'passport';

export interface PassportProfile extends Profile {
    _json?: {
        given_name: string,
        family_name: string,
        picture: string,
        email: string
    };
}

export interface UserProfile {
    displayName: string
    given_name: string,
    family_name: string,
    picture: string,
    email: string
}