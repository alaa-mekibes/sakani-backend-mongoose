import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER!,
        pass: process.env.GMAIL_APP_PASSWORD!,
    },
});

export const sendVerificationEmail = async (to: string, code: string) => {
    await transporter.sendMail({
        from: `"Sakani" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'Verify your Sakani account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
                <h2>Welcome to Sakani 🏠</h2>
                <p>Your verification code:</p>
                <h1 style="letter-spacing: 8px; color: #570df8;">${code}</h1>
                <p>This code expires in <strong>10 minutes</strong>.</p>
            </div>
        `,
    });
};