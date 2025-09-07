import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import config from "../app/config";
import { authServices } from "../app/modules/auth/auth.services";

// --- GOOGLE ---
passport.use(
    new GoogleStrategy(
        {
            clientID: config.google_client_id!,
            clientSecret: config.google_client_secret!,
            callbackURL: `${config.callback_url}/api/v1/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const result = await authServices.handleGoogleLogin(profile);

                const userWithTokens = Object.assign(result.user.toObject(), {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                });

                return done(null, userWithTokens);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

passport.use(
    new FacebookStrategy(
        {
            clientID: config.facebook_app_id as string,
            clientSecret: config.facebook_app_secret as string,
            callbackURL: `${config.callback_url}/api/v1/auth/facebook/callback`,
            profileFields: ["id", "displayName", "emails", "photos"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const result = await authServices.handleFacebookLogin(profile);
                return done(null, result);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

export default passport;
