const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "9da5b7ba6396ab",
      pass: "2a152b1fc0ef34"
    }
  });

  module.exports = transport