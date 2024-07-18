import { verifyEmailSubject, forgotPasswordEmailSubject } from "constants/mailConstants.js"
import { clientApplicationVerifyEmail_Sub_Url, clientApplicationForgotPassword_Sub_Url, clientApplicationSharedDeal_Sub_Url } from 'constants/globalConstants.js'
export const generateVerifyUserMailBodySubject = (verificationLink) => {
  const clientApplicationUrl = process.env.CLIENT_APPLICATION_URL
  var subject = verifyEmailSubject;
  var redirectUrl = clientApplicationUrl + clientApplicationVerifyEmail_Sub_Url + "/" + verificationLink;
  var body = "<html><body><a href='" + redirectUrl + "'>Verify Email</a></body></html>"
  var mailSubjectAndBody = {
    subject: subject,
    body: body
  }
  return mailSubjectAndBody;
}

export const generateForgotPasswordMailBodySubject = (verificationLink) => {
  const clientApplicationUrl = process.env.CLIENT_APPLICATION_URL
  var subject = forgotPasswordEmailSubject;
  var redirectUrl = clientApplicationUrl + clientApplicationForgotPassword_Sub_Url + "/" + verificationLink;
  var body = "<html><body><a href='" + redirectUrl + "'>Password reset link</a></body></html>"
  var mailSubjectAndBody = {
    subject: subject,
    body: body
  }
  return mailSubjectAndBody;
}

export const generateShareDealMailBodySubject = (senderName, senderEmail, dealId) => {
  const clientApplicationUrl = process.env.CLIENT_APPLICATION_URL
  var subject = senderName + " shared a deal with you"
  const dealLink = clientApplicationUrl + clientApplicationSharedDeal_Sub_Url + "/" + senderEmail + "/" + dealId
  var body = "<html><body><a href='" + dealLink + "'>Deal link</a></body></html>"
  return {
    subject, body
  }
}