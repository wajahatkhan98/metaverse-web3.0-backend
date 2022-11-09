const nodemailer = require("nodemailer");
const path = require("path");

var hbs = require("nodemailer-express-handlebars");

const handlebarOptions = {
  viewEngine: {
    extName: ".hbs",
    partialsDir: path.resolve("./views"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./views"),
  extName: ".hbs",
};

const forgotEmail = async (options) => {
  // const transporter = nodemailer.createTransport({
  //   host: "mail.gamereeserver.com",
  //   port: 587,
  //   secure: false, // upgrade later with STARTTLS
  //   auth: {
  //     user: "username",
  //     pass: "password",
  //   },
  // });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  transporter.use("compile", hbs(handlebarOptions));

  // previous messsage from the user

  // const message = {
  //   from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
  //   to: options.email,
  //   subject: options.subject,
  //   text: options.message,
  //   html: options.html,
  // };

  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    template: "forgot",
    context: {
      userName: options.userName,
      emailAddress: options.email,
      verifyURL: options.resetUrl,
    },
  };

  const mailSent = await transporter.sendMail(message);
  console.log(mailSent);
};

module.exports = forgotEmail;
