import { signupVerificationTokenExpiry, loginVerificationTokenExpiry } from 'constants/globalConstants'
import jwt from 'jsonwebtoken'
export const JWT_sign_for_signup = (dataToSign) => {
  const jwtSecretKey = process.env.JWT_KEY;
  return jwt.sign(dataToSign,
    jwtSecretKey, {
    expiresIn: signupVerificationTokenExpiry
  })
}

export const JWT_sign_for_login = (dataToSign) => {
  const jwtSecretKey = process.env.JWT_KEY;
  return jwt.sign(dataToSign,
    jwtSecretKey, {
  })
}

export const JWT_verify = (verificationToken) => {
  const jwtSecretKey = process.env.JWT_KEY;
  return jwt.verify(verificationToken, jwtSecretKey)
}