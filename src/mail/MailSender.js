import sgMail from '@sendgrid/mail'



export const sendMail = (mailIdToSend, subjectAndBody) => {
  const API_KEY = process.env.TWILLIO_API_KEY
  console.log("API_KEY", API_KEY)
  const verifiedFromEmail = process.env.TWILLIO_VERIFIED_FROM_EMAIL
  sgMail.setApiKey(API_KEY)
  console.log(subjectAndBody.body)
  const message = {
    to: mailIdToSend,
    from: verifiedFromEmail,
    subject: subjectAndBody.subject,
    text: 'Hello from sendgrid',
    html: subjectAndBody.body
  }
  sgMail.send(message).then(response => console.log('email sent', response))
}
