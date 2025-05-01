const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendOTP = async (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Password Reset OTP to e driving school',
        text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`
    };

    return transporter.sendMail(mailOptions);
};
