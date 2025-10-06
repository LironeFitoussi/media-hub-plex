import { JWTPayload } from 'express-oauth2-jwt-bearer';

declare global {
    namespace Express {
        interface Request {
            auth?: {
                payload: JWTPayload;
                header: Record<string, unknown>;
                token: string;
            };
        }
    }
}

export {};
