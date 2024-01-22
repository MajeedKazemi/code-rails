import { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";

import { UserModel } from "../models/user";
import env from "./env";

// Local strategy with passport mongoose plugin User.authenticate() function
passport.use(new LocalStrategy(UserModel.authenticate()));

// Required for our support for sessions in passport.
passport.serializeUser((user: any, done: any) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    UserModel.findById(id).then(
        (user: any) => done(null, user),
        (err: any) => done(err, null)
    );
});

export const getToken = (user: any) => {
    return jwt.sign(user, env.JWT_SECRET, {
        expiresIn: parseInt(env.SESSION_EXPIRY),
    });
};

export const jwtPassport = passport.use(
    new JwtStrategy(
        {
            secretOrKey: env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        (jwt_payload, done) => {
            // Search the user with jwt.payload ID field
            UserModel.findOne({ _id: jwt_payload._id }).then(
                (user: any) => {
                    if (user) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                },
                (err: any) => {
                    return done(err, false);
                }
            );
        }
    )
);

// Verify an incoming user with jwt strategy we just configured above
export const verifyUser = passport.authenticate("jwt", { session: false });

export const getRefreshToken = (user: any) => {
    const refreshToken = jwt.sign(user, env.REFRESH_TOKEN_SECRET, {
        expiresIn: parseInt(env.REFRESH_TOKEN_EXPIRY),
    });
    return refreshToken;
};

export const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    // Since localhost is not having https protocol,
    // secure cookies do not work correctly (in postman)
    secure: !env.dev,
    signed: true,
    sameSite: env.dev ? 'lax' : 'none',
    maxAge: parseInt(env.REFRESH_TOKEN_EXPIRY),
};
