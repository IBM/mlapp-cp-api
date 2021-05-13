var Q = require('q');

var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");


var transporter = nodemailer.createTransport(smtpTransport('SMTP',{
    port: 465,
    secure:false,
    auth: {
         user: global_config.email.settings.username,
         pass: global_config.email.settings.password
    },            
    authMethod:'NTLM',
    tls: {rejectUnauthorized: false}
})
);

function sendMail(subject,text,html) {
    var deferred = Q.defer();
    var mailOptions = {
        from:global_config.email.settings.sender_name + "<"+global_config.email.settings.username+">",
        to: global_config.email.settings.username,
        subject:subject,
        text:text,
        html: html
    }

    
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            deferred.reject(error);
        }
        else{
            deferred.resolve(response);
        }
    });

    return deferred.promise;
}

module.exports = {
    sendMail: sendMail
};