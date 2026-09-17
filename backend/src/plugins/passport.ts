import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import secureSession from '@fastify/secure-session';
import fastifyPassport from '@fastify/passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getEnv } from '../config/env.js';

export default fp(async function passportPlugin(fastify: FastifyInstance): Promise<void> {
  const env = getEnv();

  // 1. Session Plugin required for Passport
  await fastify.register(secureSession, {
    secret: env.SESSION_SECRET,
    salt: 'udyamsetu_salt16',
    cookieName: 'arthsetu_session',
    cookie: {
      path: '/',
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
    },
  });

  // 2. Initialize Fastify Passport
  await fastify.register(fastifyPassport.initialize());
  await fastify.register(fastifyPassport.secureSession());

  // 3. Serializers
  fastifyPassport.registerUserSerializer(async (user: any) => {
    return user.id;
  });

  fastifyPassport.registerUserDeserializer(async (id: string) => {
    return fastify.prisma.user.findUnique({ where: { id } });
  });

  // 4. Configure Google OAuth Strategy
  const googleClientId = env.GOOGLE_CLIENT_ID || 'MISSING_GOOGLE_CLIENT_ID';
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET || 'MISSING_GOOGLE_CLIENT_SECRET';

  fastifyPassport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const name = profile.displayName || profile.name?.givenName || 'Google User';
          const avatarUrl = profile.photos?.[0]?.value;
          const googleId = profile.id;

          if (!email && !googleId) {
            return done(new Error('Google profile did not return valid email or ID'), undefined);
          }

          // Check existing user by googleId or email
          let user = await fastify.prisma.user.findFirst({
            where: {
              OR: [
                { googleId },
                ...(email ? [{ email }] : []),
              ],
            },
          });

          if (user) {
            // Update existing user with googleId or avatarUrl if missing
            if (!user.googleId || !user.avatarUrl) {
              user = await fastify.prisma.user.update({
                where: { id: user.id },
                data: {
                  googleId: user.googleId ?? googleId,
                  avatarUrl: user.avatarUrl ?? avatarUrl,
                  email: user.email ?? email,
                },
              });
            }
          } else {
            // Create new Google user
            user = await fastify.prisma.user.create({
              data: {
                googleId,
                email,
                name,
                avatarUrl,
                isPhoneVerified: false,
                whatsappOptIn: true,
              },
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      },
    ),
  );
}, {
  name: 'passport',
  dependencies: ['prisma'],
});
