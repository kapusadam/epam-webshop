var nodemailer = require('nodemailer');
var config = require('../config');

module.exports = nodeMailer = function() {
};

nodeMailer.prototype.sendMail = function(client, subject, orderDetails) {
    var transporter = nodemailer.createTransport(config.smtp);
    transporter.verify(function (error) {
        if (error) {
            console.log(error);
        } else {
            console.log('Server is ready to take our messages');
        }
    });
    config.mailOptions.to = client;
    config.mailOptions.subject = subject;
    config.mailOptions.text = orderDetails;

    transporter.sendMail(config.mailOptions).then(function () {
        console.log("Message sent");
    }).catch(function (err) {
        console.log(err);
    });
};