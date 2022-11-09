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

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  console.log("before compile");

  transporter.use("compile", hbs(handlebarOptions));

  console.log("after compile");

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
    template: "email",
    context: {
      userName: options.userName,
      emailAddress: options.email,
      verifyURL: options.verifyURL,
    },
  };

  const mailSent = await transporter.sendMail(message);
  console.log(mailSent);
};

module.exports = sendEmail;
