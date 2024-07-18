import User from 'db/models/user-model.js'
import SignupUnverified from 'db/models/signupUnverified-model.js'
import * as bcrypt from 'utils/Bcrypt'
import { OAuth2Client } from 'google-auth-library';
import UnsharedDeals from 'db/models/unshared-deals.js'
import { generateVerifyUserMailBodySubject, generateForgotPasswordMailBodySubject } from 'mail/mailSubjectAndBodyGenerator.js'
import randomstring from "randomstring"
import { sendMail } from 'mail/MailSender'
import { JWT_sign_for_signup, JWT_sign_for_login, JWT_verify } from 'utils/JWT'
import { ObjectId } from 'mongodb'
export const signup_post = async (req, res, next) => {
  // get all request params
  const { email, password, username } = req.body
  try {
    //check if email already exists
    const user = await User.instance.findOne({
      email: email
    })
    if (user != null) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }
    else {
      const hash = await bcrypt.hash(password)
      console.log("hash", hash)
      const verificationString = randomstring.generate(100);
      let dataToInsert = {
        email, password: hash, verificationString, timestamp: new Date(), username
      }
      //Insert or update if present
      const result = await SignupUnverified.instance.updateOne({ email: email }, { $set: dataToInsert }, { upsert: true })
      console.log(result);
      let signedVerificationString = JWT_sign_for_signup({
        veriString: email + " " + verificationString
      })
      console.log("signedVerificationString", signedVerificationString)
      const mailSubjectAndBody = generateVerifyUserMailBodySubject(signedVerificationString)
      sendMail(email, mailSubjectAndBody)

      res.status(201).json({
        message: 'Mail sent to the registered email'
      })
    }
  } catch (err) {
    console.log(err.message)
    throw { message: "Something went wrong", status: 500 }
  }

}

export const user_delete = async (req, res, next) => {
  console.log({ _id: req.params.userId })
  try {
    await User.instance.deleteOneById(req.params.userId)
    res.status(200).json({
      message: 'User deleted'
    });
  }
  catch (err) {
    throw { message: "Something went wrong", status: 500 }
  }
}

export const login_post = async (req, res, next) => {
  try {
    const user = await User.instance.findOne({
      email: req.body.email
    })
    console.log("user", user)
    if (user == null) {
      throw { message: "Auth failed", status: 401 }
    } else {
      try {
        const result = await bcrypt.compare(req.body.password, user.password)
        console.log(result)
        if (result) {
          const token = JWT_sign_for_login({
            email: user.email,
            userId: user._id
          })
          res.status(200).json({
            message: "Auth passed",
            token: token,
            userData: { email: user.email, deals: user.deals, username: user.username }
          });
        } else {
          throw { message: "Auth failed", status: 401 }
        }
      } catch (err) {
        console.log(err)
        throw { message: "Auth failed", status: 401 }
      }
    }
  } catch (error) {
    throw { message: "Auth failed", status: 401 }
  }
}

export const verify_signup = async (req, res, next) => {
  console.log("verify signup")
  var { verificationToken } = req.body;
  try {
    var decodedToken = JWT_verify(verificationToken);
  } catch (err) {
    console.log("error token expired")
    throw { message: "token expired", status: 401 }
  }
  var veriString = decodedToken.veriString

  var verificationUserEmail = veriString.substr(0, veriString.indexOf(' '));
  var verificationString = veriString.substr(veriString.indexOf(' ') + 1);
  let unverifiedUserDetails;
  console.log(veriString)
  try {
    unverifiedUserDetails = await SignupUnverified.instance.findOne({
      email: verificationUserEmail
    })
  }
  catch (err) {
    console.log(err)
    throw { message: "Something went wrong", status: 500 }
  }

  if (unverifiedUserDetails != null && unverifiedUserDetails != undefined && unverifiedUserDetails.verificationString === verificationString) {
    const userData = ({
      ...unverifiedUserDetails,
      authType: "password"
    });
    try {
      userData.sharedDeals = await getSharedDealsFromUnsharedCollectionWhileSignup(unverifiedUserDetails.email)
      await User.instance.insertOne(userData)
    } catch (err) {
      console.log(err)
      throw { message: "Something went wrong", status: 500 }
    }
    try {
      await SignupUnverified.instance.deleteOne({
        _id: unverifiedUserDetails._id
      })
    } catch (err) { }

    const token = JWT_sign_for_login({
      email: unverifiedUserDetails.email,
      userId: unverifiedUserDetails._id
    })
    res.status(201).json({
      message: "Signup success",
      token: token,
      userData: { email: unverifiedUserDetails.email }
    });

  } else {
    throw { message: "Something went wrong", status: 500 }
  }
}

export const forgot_password = async (req, res, next) => {
  var userEmail = req.body.email
  const verificationString = randomstring.generate(100);
  try {
    const dataToInsert = { verificationString: verificationString }
    const data = await User.instance.updateOne({ email: userEmail }, { $set: dataToInsert }, { upsert: true })
    var signedVerificationString = JWT_sign_for_signup({
      veriString: req.body.email + " " + verificationString
    })
    var mailSubjectAndBody = generateForgotPasswordMailBodySubject(signedVerificationString)
    console.log(mailSubjectAndBody.body)
    sendMail(userEmail, mailSubjectAndBody)
    res.status(201).json({
      message: 'Mail sent to ' + userEmail
    })
  } catch (error) {
    throw { message: "Something went wrong", status: 500 }
  }
}

//accepts payload of verificationToken and password
export const verify_forgotPassword = async (req, res, next) => {
  var verificationToken = req.body.verificationToken;
  let decodedToken
  try {
    decodedToken = JWT_verify(verificationToken);
  } catch (err) {
    throw { message: "Token invalid", status: 401 }
  }
  console.log(decodedToken)
  var veriString = decodedToken.veriString
  var verificationUserEmail = veriString.substr(0, veriString.indexOf(' '));
  var verificationString = veriString.substr(veriString.indexOf(' ') + 1);
  try {
    const userDetails = await User.instance.findOne({
      email: verificationUserEmail
    })

    if (userDetails != null && userDetails != undefined) {
      if (userDetails.verificationString === verificationString) {
        const hash = await bcrypt.hash(req.body.password)
        console.log("hash", hash)
        await User.instance.updateOne({ email: verificationUserEmail }, { $set: { password: hash } })

        res.status(201).json({
          message: "password reset success",

        });
      }
    }
  } catch (error) {
    console.log(error)
    throw { message: "Something went wrong", status: 500 }
  }
}

export const clearAllVerifiedUser = (req, res, next) => {
  User.instance.drop().then((data) => {
    res.status(200).json({
      status: "success",
      message: data
    });
  });
}

export const clearAllUnverifiedUser = (req, res, next) => {
  console.log("Clear all unverified user");
  SignupUnverified.instance.drop().then((data) => {
    res.status(200).json({
      status: "success",
      message: data
    });
  })
    .catch((err) => {
      throw { message: "Something went wrong", status: 500 }
    })
}

export const googleLogin = async (req, res, next) => {
  const { tokenId } = req.body
  console.log("tokenId", tokenId);
  const googleClient = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);
  try {
    const verificationResponse = await googleClient.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_OAUTH_CLIENT_ID })
    console.log(verificationResponse);
    const { name, email } = verificationResponse.payload;
    const user = await User.instance.findOne({ email: email })
    if (user == null) {
      const _id = ObjectId()
      const sharedDeals = await getSharedDealsFromUnsharedCollectionWhileSignup(email)
      await User.instance.insertOne({ _id, email, authType: "google", username: name, sharedDeals })
      const token = JWT_sign_for_login({
        email: email,
        userId: _id
      })
      res.status(201).json({
        token: token,
        userData: { email: email, username: name }
      });
    } else {
      const token = JWT_sign_for_login({
        email: user.email,
        userId: user._id
      })
      res.status(201).json({
        token: token,
        userData: { email: email, deals: user.deals, username: user.username }
      });
    }
  } catch (err) {
    console.log(err)
    throw { message: "Something went wrong", status: 500 }
  }
}

export const getUserData = async (req, res, next) => {
  const { _id } = req.body
  try {
    const user = await User.instance.findOne({ _id: ObjectId(_id) })
    if (user != null) {
      res.status(200).json({
        userData: { email: user.email, deals: user.deals, username: user.username }
      })
    } else {
      console.log("user is null with id", _id)
      throw { message: "Something went wrong", status: 500 }
    }
  } catch (err) {
    console.log(err)
    throw { message: "Something went wrong", status: 500 }
  }
}

const getSharedDealsFromUnsharedCollectionWhileSignup = async (email) => {
  const sharedDealsResponse = await UnsharedDeals.instance.findOneAndDelete({ email: email });
  return sharedDealsResponse?.value?.deals;
}
