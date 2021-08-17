const sgMail = require('@sendgrid/mail');

const sendgridAPIKey = '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'

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'emircan.kucukmotor@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app!`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'emircan.kucukmotor@gmail.com',
        subject: 'We are Sorry to hear!',
        text: `Hi ${name}, We are sorry to hear that you quit! What was the problem?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}