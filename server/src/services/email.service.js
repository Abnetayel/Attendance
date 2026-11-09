const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

/**
 * Send welcome email to new employee with password setup link
 */
const sendWelcomeEmail = async ({ to, name, setupLink }) => {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'AttendMS'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject: 'Welcome to AttendMS — Set Up Your Password',
        html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #f0f2f5; padding: 32px;">
                <div style="background: linear-gradient(135deg, #1a1a2e, #0f3460); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 1.8rem;">AttendMS</h1>
                    <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">Attendance Management System</p>
                </div>
                <div style="background: #fff; border-radius: 0 0 16px 16px; padding: 32px;">
                    <h2 style="color: #1a1a2e; margin-top: 0;">Welcome, ${name}!</h2>
                    <p style="color: #555; line-height: 1.6;">
                        Your account has been created. Click the button below to set your password and get started.
                        This link is valid for <strong>24 hours</strong>.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${setupLink}"
                           style="background: #0d6efd; color: #fff; padding: 14px 32px; border-radius: 8px;
                                  text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-block;">
                            Set My Password
                        </a>
                    </div>
                    <p style="color: #999; font-size: 0.85rem;">
                        If you did not expect this email, you can safely ignore it.
                        <br>This link will expire after 24 hours.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                    <p style="color: #bbb; font-size: 0.8rem; margin: 0;">
                        Or copy this link into your browser:<br>
                        <span style="color: #0d6efd;">${setupLink}</span>
                    </p>
                </div>
            </div>
        `,
    });
};

module.exports = { sendWelcomeEmail };
