var nodemailer = require('nodemailer');
var config = require('../config');
var transporter = nodemailer.createTransport(config.smtp);

module.exports = nodeMailer = function() {
    transporter.verify(function (error) {
        if (error) {
            console.log(error);
        } else {
            console.log('Server is ready to take our messages');
        }
    });
};

nodeMailer.prototype.sendMail = function(client, subject, orderDetails) {
    config.mailOptions.to = client;
    config.mailOptions.subject = subject;
    config.mailOptions.text = orderDetails;

    return new Promise(function(resolve, reject) {
        if (transporter.sendMail(config.mailOptions)) {
            resolve("mail sent")
        }
        else {
            reject ("something went wrong")
        }
    });
};