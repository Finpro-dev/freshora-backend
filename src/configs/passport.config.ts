import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { GOOGLE_OAUTH } from "./dotenv.config";
import { AppError } from "../utils/appError.util";
import { prisma } from "./prisma.config";
import { createUniqueReferralCode } from "../utils/createUniqueReferralCode";
import { generateFullName } from "../utils/userDataTransform.util";

export const configureGooglePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_OAUTH.CLIENT_ID!,
        clientSecret: GOOGLE_OAUTH.CLIENT_SECRET!,
        callbackURL: "http://localhost:8000/api/auth/google/callback",
        passReqToCallback: true,
      },
      async (_req, _accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0].value;
          const [firstName, lastName] = profile.displayName.split(" ");
          const avatar = profile.photos?.[0].value;
          const authProviderId = profile.id;

          if (!email)
            return done(
              new AppError(404, "Email is not found in your Google account"),
            );

          // check email in db
          let user = await prisma.user.findFirst({
            where: {
              authProviderId,
            },
          });

          // if exist, update / link to current google account
          if (user) {
            user = await prisma.user.update({
              where: {
                email,
              },

              data: {
                firstName,
                lastName: lastName || firstName,
                authProvider: "GOOGLE", // update authProvider
                authProviderId,
                avatar: user.avatar || avatar,
                isVerified: true,
              },
            });
          } else {
            // create new user
            user = await prisma.$transaction(async (tx) => {
              const myReferralCode = await createUniqueReferralCode(tx);
              const createdUser = await tx.user.create({
                data: {
                  firstName,
                  lastName: lastName || firstName,
                  email,
                  authProvider: "GOOGLE",
                  authProviderId,
                  avatar,
                  myReferralCode,
                  role: "CUSTOMER",
                  gender: "MALE",
                  isVerified: true,
                },
              });

              return createdUser;
            });
          }

          // success! send user data to next layer (controller)
          // null means -> no error
          return done(null, {
            userId: user.userId,
            fullName: generateFullName(user.firstName, user.lastName),
            role: user.role,
          });
        } catch (error) {
          // if there is an error in db, forward to passport
          return done(error, false);
        }
      },
    ),
  );
};
