const nodemailer = require("nodemailer");

async function sendEmail({from, to, subject, text, html}){
      let transporter = nodemailer.createTransport({
          host:process.env.SMTP_HOST,
          port:process.env.SMTP_PORT,
          secure:false,
          auth:{
              user:process.env.MAIL_USER,
              pass:process.env.MAIL_PASSWORD,
          },
      });
      await transporter.sendMail({
          from:`inshare <${from}>`,
          to,
          subject,
          text,
          html,
      });
}

module.exports = sendEmail;