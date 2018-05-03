var nodemailer = require('nodemailer');

module.exports = config ={
    smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: "webshopteszt123@gmail.com",
            pass: "asdQWE123"
        }
    },
    mailOptions: {
        from: '"Epam-webshop" <webshopteszt123@gmail.com>',
        to: null,
        subject: null,
        text: 'This is an auto generated message :)' //orderDetails
    }
};