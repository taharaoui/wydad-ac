import { createHash, randomBytes } from 'node:crypto';

export const newToken = () => randomBytes(32).toString('base64url');
export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
/** IPs and emails are only ever logged hashed, salted with a server secret when available */
export const privateHash = (value: string) => sha256(`${process.env.NEWSLETTER_HASH_SALT ?? 'wydad'}:${value}`);
