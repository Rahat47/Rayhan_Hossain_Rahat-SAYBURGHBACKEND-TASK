import crypto from 'crypto';

export const randomToken = () => {
    const randomBytes = crypto.randomBytes(32);
    return randomBytes.toString('hex');
};
