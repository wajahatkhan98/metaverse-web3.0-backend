import { SMTPClient } from "emailjs";
const client = new SMTPClient({
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  host: "smtp.your-email.com",
  ssl: true,
});

exports.emailSend = (email, subject, message) => {
  client.send(
    {
      text: "i hope this works",
      from: "you <username@your-email.com>",
      to: "someone <someone@your-email.com>, another <another@your-email.com>",
      cc: "else <else@your-email.com>",
      subject: "testing emailjs",
    },
    (err, message) => {
      console.log(err || message);
    }
  );
};
