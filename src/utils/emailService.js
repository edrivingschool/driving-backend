const nodemailer = require('nodemailer');

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send OTP Email Function
exports.sendOTP = async (to, otp) => {
    const mailOptions = {
        from: `"e-Driving School Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: '🔐 Your OTP Code for Password Reset - e-Driving School',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://i.imgur.com/2nCt3Sbl.png" alt="e-Driving School Logo" style="width: 80px; margin-bottom: 10px;" />
                    <h2 style="color: #007BFF;">e-Driving School</h2>
                </div>
                <p style="font-size: 16px; color: #333;">Hello,</p>
                <p style="font-size: 15px; color: #555;">We received a request to reset your password. Use the One-Time Password (OTP) below to complete your request:</p>
                <div style="margin: 30px 0; text-align: center;">
                    <div style="display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #007BFF; background-color: #f1f8ff; border: 2px dashed #007BFF; border-radius: 8px;">
                        ${otp}
                    </div>
                </div>
                <p style="font-size: 15px; color: #555;">Please note, this OTP will expire in <strong>10 minutes</strong>.</p>
                <p style="font-size: 15px; color: #555;">If you did not request this, please ignore this email or contact our support team immediately.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 14px; color: #888;">Thank you,<br/>The e-Driving School Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};
