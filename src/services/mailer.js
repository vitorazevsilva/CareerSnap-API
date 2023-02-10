const fs = require('fs');
const path = require('path');

const nodemailerfile = require('../../nodemailer');

module.exports = (app) => {
    const sendEmailUsingTemplate = async (to, subject, type, data) => {
        if (!to || !subject || !type || !data) return {err: 'Missing fields'};
        let emailTemplate = fs.readFileSync(path.join(__dirname, `../mails/${type}-template.html`), 'utf8');
      

          emailTemplate = await replaceWords(emailTemplate, data)

      
        let mailOptions = {
          from: nodemailerfile[process.env.NODE_ENV].from,
          subject: subject,
          html: emailTemplate
        };

        if (Array.isArray(to)) {
          mailOptions.bcc = to;
        } else {
          mailOptions.to = to;
        }
        return await app.mailer.sendMail(mailOptions);
      }
      
    
    const sendPlainEmail = async (to, subject, message) => {
        if (!to || !subject || !message)
            return {err : 'Missing fields'}
        let mailOptions = {
            from: nodemailerfile[process.env.NODE_ENV].from,
            to: to,
            subject: subject,
            html: message
        };

        return await app.mailer.sendMail(mailOptions);
    }
    const replaceWords = (text, replaceWords) => {
      let updatedText = text;
    
      Object.keys(replaceWords).forEach(word => {
        updatedText = updatedText.replace(new RegExp(`{{${word}}}`, 'g'), replaceWords[word]);
      });
    
      return updatedText;
    };
    return {sendEmailUsingTemplate, sendPlainEmail}
}