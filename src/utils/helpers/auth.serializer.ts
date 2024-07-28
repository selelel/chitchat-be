import { Inject, Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class SessionSerializer extends PassportSerializer{
    constructor(@Inject("AuthService") private readonly authService: AuthService){
        super();
    }

    async serializeUser(user: any, done: Function) {
        console.log("to deserialize");
        done(null, user)
    }
    async deserializeUser(payload: any, done: Function) {
        console.log("to deserialize", payload);
        const user = await this.authService.findUserById(payload.id)
        return user ?  done(null, user): done(null, null)
    }
}