import { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy } from 'passport-jwt';
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import { LoggerProxy as Logger } from 'n8n-workflow';
import { JwtPayload } from '../Interfaces';
import type { AuthenticatedRequest } from '@/requests';
import config from '@/config';
import { AUTH_COOKIE_NAME } from '@/constants';
import { issueCookie, resolveJwtContent } from '../auth/jwt';
import { UserService } from '@/user/user.service';
import { readFileSync } from 'fs';

const jwtFromRequest = (req: Request) => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	return (req.cookies?.[AUTH_COOKIE_NAME] as string | undefined) ?? null;
};

export const jwtAuth = (): void => {
	const jwtStrategy = new Strategy(
		{
			jwtFromRequest,
			secretOrKey: config.getEnv('userManagement.jwtSecret'),
		},
		async (jwtPayload: JwtPayload, done) => {
			try {
				const user = await resolveJwtContent(jwtPayload);
				return done(null, user);
			} catch (error) {
				Logger.debug('Failed to extract user from JWT payload', { jwtPayload });
				return done(null, false, { message: 'User not found' });
			}
		},
	);

	passport.use(jwtStrategy);
};

/**
 * middleware to refresh cookie before it expires
 */
export const refreshExpiringCookie: RequestHandler = async (
	req: AuthenticatedRequest,
	res,
	next,
) => {
	const cookieAuth = jwtFromRequest(req);
	if (cookieAuth && req.user) {
		const cookieContents = jwt.decode(cookieAuth) as JwtPayload & { exp: number };
		if (cookieContents.exp * 1000 - Date.now() < 259200000) {
			// if cookie expires in < 3 days, renew it.
			await issueCookie(res, req.user);
		}
	}
	next();
};

export const samlAuth = (): void => {
	console.log('setting up saml stuff');

	const privatekey = readFileSync('/home/krynble/Workspace/Projects/n8n/sp-pvt.key.pem', 'utf8');
	// const cert = readFileSync('/home/krynble/Workspace/Projects/n8n/sp-pub.cert.pem', 'utf8');

	const samlStrategy = new SamlStrategy(
		{
			callbackUrl: 'http://localhost:5678/rest/login/saml/callback',
			cert: 'MIICmzCCAYMCBgGFprIClTANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZuOG5hcHAwHhcNMjMwMTEyMTU1NDIyWhcNMzMwMTEyMTU1NjAyWjARMQ8wDQYDVQQDDAZuOG5hcHAwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCicuNSxQ378kzY01qEDLgnhqRWh0XgqK0i4MB72lzIA/d1GIMAJ0m5pKK0LolV6uY1B5OvVYjRyT1SNOz2o0ajT6rlH9k+2see0qXZ43kCjV35SpAPFyvqT70pDBc6XtUiZ3wDF+LD20v33hsSu/MjQVixlx5GE2KjmVmOdRvm5ZPR51Fp03GKQFBD1/8eh7wL72+6yOvHQD/QAIupCBoKmZQueClnO/wLYdq0zpumIj+YzQ5qyF60UuRwT4xJGTYe5i/B7Q3ls1iixxblbxvwPMwXJ6GY5+yHRgf4OHJ2kJAW3AbJwe60KbXVM6Af5Xl5c4E0ubYiCAk3QqXdwHPBAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAB3x14HRVaU3WSYJyQP4v71y40xKDkmF1TJw0FwjE+yUpEvcoLrquw7/RtuvudVqfGueL2HD9eTtCEXi69jf6IjlGE7Niugr7L3e9blv3bviEJpS5zV9wTYESJ2m743wNrkVnUgkMsr85WQQzzok+zlCC/NnQYVGCz2R61AgMe8zczNJnJNcfvTRCXocyEsYmZ5YFYpsJR5dYEVoMPaY5gE2baDJI6jWi1N016RxSx8CKXiQJHkb0m45SwIHC7XCozsbZIEzELK+3GyIU9n+dv437IMRBFZNj2zhGl4LCgL24ft4CzQonJxl//B6bLEMISJTZ4bkJ268Cq1lsd2SxZc=',
			issuer: 'n8napp',
			entryPoint: 'http://localhost:8080/realms/n8nio/protocol/saml',
			signatureAlgorithm: 'sha256',
			decryptionPvk: privatekey,
			privateKey: privatekey,
		},
		async function (req, profile, done) {
			console.log('trying to find a user based on profile', profile);
			if (!profile?.email) {
				return done(new Error('Email not found in profile'));
			}

			const user = await UserService.get({ email: profile.email });

			if (!user) {
				return done(new Error('User not found'));
				// TODO: Provision user.
			}

			done(null, user as unknown as Record<string, unknown>);
		},
		function (req, profile, done) {
			console.log('received profile for logout', profile);
			// for logout
			// findByNameID(profile.nameID, function (err, user) {
			// 	if (err) {
			// 		return done(err);
			// 	}
			// 	return done(null, user);
			// });
		},
	);

	passport.use(samlStrategy);
};
