import nodemailer from 'nodemailer';
import { getVerificationContent, getBaseTemplate, getResetPasswordContent, getWelcomeContent } from './emailTemplates';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER!,
        pass: process.env.GMAIL_APP_PASSWORD!,
    },
});

export const sendVerificationEmail = async (to: string, code: string) => {
    const content = getVerificationContent(code);
    const html = getBaseTemplate(content, 'Verify Your Sakani Account');

    await transporter.sendMail({
        from: `"Sakani" <${process.env.GMAIL_USER}>`,
        to,
        subject: '🎯 Verify your Sakani account',
        html,
    });
};

export const sendResetPasswordEmail = async (to: string, code: string) => {
    const content = getResetPasswordContent(code);
    const html = getBaseTemplate(content, 'Reset Your Sakani Password');

    await transporter.sendMail({
        from: `"Sakani" <${process.env.GMAIL_USER}>`,
        to,
        subject: '🔑 Reset your Sakani password',
        html,
    });
};

export const sendWelcomeEmail = async (to: string, name: string) => {
    const content = getWelcomeContent(name);
    const html = getBaseTemplate(content, 'Welcome to Sakani');

    await transporter.sendMail({
        from: `"Sakani" <${process.env.GMAIL_USER}>`,
        to,
        subject: '🏠 Welcome to Sakani! Start your journey',
        html,
    });
};