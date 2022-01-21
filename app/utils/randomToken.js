import crypto from 'crypto';

export const randomToken = () => {
    const randomBytes = crypto.randomBytes(40);
    return randomBytes.toString('hex');
};
