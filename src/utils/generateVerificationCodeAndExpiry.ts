/**
 * 
 * @returns generated Verification Code And Expiry date
 */
export const generateVerificationCodeAndExpiry = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return { code, expiry }
}