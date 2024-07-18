import User from 'db/models/user-model.js'
import UnsharedDeals from 'db/models/unshared-deals.js'
import { ObjectId } from 'mongodb'
import { sendMail } from 'mail/MailSender'

import { generateShareDealMailBodySubject } from '../../mail/mailSubjectAndBodyGenerator';
export const insertDeal_post = async (req, res, next) => {
  const { _id, deal } = req.body;
  try {
    deal._id = ObjectId()
    deal.timestamp = new Date()
    console.log(_id, deal)
    const result = await User.instance.updateOne({ _id: ObjectId(_id) }, { $push: { deals: deal } })
    console.log(result, result.modifiedCount)
    if (result.modifiedCount == 1) {
      res.status(201).json({ message: "Added successfully", dealId: deal._id })
    } else {
      throw { message: "something went wrong", status: 500 }
    }
  }
  catch (err) {
    console.log(err)
    throw { message: "something went wrong", status: 500 }
  }
}

export const deleteDeal_delete = async (req, res, next) => {
  const { _id, deal_id } = req.body;
  try {
    const result = await User.instance.findOneAndUpdate({ _id: ObjectId(_id) }, { $pull: { 'deals': { _id: ObjectId(deal_id) } } })
    console.log(result, result.modifiedCount)
    const deletedDeal = result.value.deals.find(dealObject => String(dealObject._id) === deal_id)
    const sharedToArray = deletedDeal?.sharedTo || []
    console.log("sharedTo", sharedToArray)
    const deleteSharedDealPromisesArray = sharedToArray?.map((sharedToEmailItem) => getDeleteSharedDealPromise(sharedToEmailItem, deal_id))
    Promise.all(deleteSharedDealPromisesArray).then(data => {
      res.status(201).json({ message: "deleted successfully" })
    })
  }
  catch (err) {
    console.log(err)
    throw { message: "something went wrong", status: 500 }
  }
}

export const updateDeal_post = async (req, res, next) => {
  const { _id, deal_id, deal } = req.body;
  try {
    deal._id = ObjectId(deal_id)
    const { dealInfo, dealCalculationInfo, irr } = deal
    const result = await User.instance.updateOne({ _id: ObjectId(_id), "deals._id": ObjectId(deal_id) }, { $set: { "deals.$.dealInfo": dealInfo, "deals.$.dealCalculationInfo": dealCalculationInfo, "deals.$.irr": irr } })
    if (result.modifiedCount == 1) {
      res.status(201).json({ message: "updated successfully" })
    } else {
      throw { message: "something went wrong", status: 500 }
    }
  }
  catch (err) {
    console.log(err)
    throw { message: "something went wrong", status: 500 }
  }
}



export const fetchEmailListForSearchQuery_get = async (req, res, next) => {
  let { emailSearchString } = req.query
  // console.log("emailSearchString", emailSearchString)
  if (emailSearchString == null || emailSearchString == undefined) {
    emailSearchString = ""
  }
  const regexString = '^' + emailSearchString
  const users = await User.instance.find({ "email": { '$regex': regexString, '$options': 'i' } }, { email: 1, _id: 0 }).limit(10).toArray()
  res.status(200).send(users)
}

export const shareDeal_post = async (req, res, next) => {
  let { dealIdArray, senderEmail, emailArrayToShare, _id } = req.body
  console.log(dealIdArray, senderEmail, emailArrayToShare, _id)
  try {
    const userData = await User.instance.findOne({ _id: ObjectId(_id), email: senderEmail })

    if (userData == null) {
      throw { message: "something went wrong" }
    }
    const dealData = userData.deals.filter((deal) => String(deal._id) == dealIdArray[0])[0]
    emailArrayToShare = emailArrayToShare.filter(email => !dealData?.sharedTo?.includes(email))
    const updatedResponseInSenderDeal = await User.instance.updateOne({ _id: ObjectId(_id), "deals._id": ObjectId(dealIdArray[0]) }, { $push: { "deals.$.sharedTo": { $each: emailArrayToShare } } })
    console.log("UpdatedResponse", updatedResponseInSenderDeal)
    const sharedDealsStatus = await insertDealForUsersListToShare(emailArrayToShare, dealIdArray, senderEmail);
    const failedToInsertEmails = sharedDealsStatus.filter(dealStatus => dealStatus.status === "fail").map(dealStatus => dealStatus.email)
    if (failedToInsertEmails.length == 0) {
      const mailSubjectAndBody = generateShareDealMailBodySubject(userData.username, senderEmail, dealIdArray[0])
      emailArrayToShare.forEach(emailItem => sendMail(emailItem, mailSubjectAndBody))
      res.status(201).json({
        message: "success"
      })
    } else {
      res.status(501).json({
        status: "failed",
        failedEmailList: failedToInsertEmails
      })
    }
  }
  catch (err) {
    console.log("error", err);
    throw { message: "something went wrong", status: 500 }
  }
}

export const getSingleSharedDealData_get = async (req, res, next) => {
  const { senderEmail, dealId } = req.query
  const { _email } = req.body
  console.log(senderEmail, dealId, _email)
  try {
    const result = await getDealInfoByEmailAndDealId(_email, senderEmail, dealId);
    console.log(result)
    if (result.status == "success") {
      res.status(200).json({
        dealData: result.dealData
      })
    } else {
      console.log(result.message, "message")
      throw { message: result.message, status: 500 }
    }
  } catch (err) {
    throw { message: err.message, status: 500 }
  }
}

export const getAllSharedDealsOfUser_get = async (req, res, next) => {
  const { _id } = req.body
  try {
    const userData = await User.instance.findOne({ _id: ObjectId(_id) })
    const sharedDeals = userData.sharedDeals
    console.log("sharedDeals:", sharedDeals)
    const allSharedDealPromise = sharedDeals?.map((sharedDealItem) => { return getDealInfoByEmailAndDealId(userData.email, sharedDealItem.senderEmail, sharedDealItem.dealId) }) || []
    Promise.all(allSharedDealPromise).then((sharedDealsResponseArray) => {
      const successfullyFetchedDeals = sharedDealsResponseArray.filter((sharedDealsResponseItem) => sharedDealsResponseItem.status === "success")
      const responseDealsDataArray = successfullyFetchedDeals.map(successfullyFetchedDealItem => successfullyFetchedDealItem.dealData)
      if (responseDealsDataArray.length == 0 && sharedDealsResponseArray.length > 1) {
        throw { message: 'something went wrong', status: 500 }
      }
      console.log("response")
      res.status(200).json({ deals: responseDealsDataArray })
    })
  } catch (err) {
    throw { message: err.message, status: 500 }
  }
}


const insertDealForUsersListToShare = (emailArrayToShare, dealIdArray, senderEmail) => {
  return new Promise((resolve, reject) => {
    Promise.all(getAllPromisesForShare(emailArrayToShare, dealIdArray, senderEmail)).then((sharedDealsStatus) => {
      resolve(sharedDealsStatus)
    })
  })
}

const getAllPromisesForShare = (emailArrayToShare, dealIdArray, senderEmail) => {
  const promiseArray = []
  const dealsArray = dealIdArray.map(dealId => { return { senderEmail, dealId } })
  emailArrayToShare.forEach((emailToShare) => {
    promiseArray.push(new Promise((resolve, reject) => {
      User.instance.updateOne({ email: emailToShare }, { $push: { sharedDeals: { $each: dealsArray } } })
        .then(updateResponse => {
          //if user doesnt exist in users collection
          if (updateResponse.modifiedCount === 0) {
            UnsharedDeals.instance.findOne({ email: emailToShare }).then(userInUnsharedDealCollection => {
              //if user not exist in UnsharedDeals collection
              if (userInUnsharedDealCollection === null) {
                UnsharedDeals.instance.insertOne({ email: emailToShare, deals: dealsArray })
                  .then(response => {
                    resolve({ status: "success", email: emailToShare })
                  })
                  .catch(err => {
                    console.log(err);
                    resolve({ status: "fail", email: emailToShare })
                  })
              }
              //if user exist in UnsharedDeals collection
              else {
                UnsharedDeals.instance.updateOne({ email: emailToShare }, { $push: { deals: { $each: dealsArray } } })
                  .then(response => {
                    resolve({ status: "success", email: emailToShare })
                  })
                  .catch(err => {
                    console.log(err);
                    resolve({ status: "fail", email: emailToShare })
                  })
              }
            })
          } else {
            resolve({ status: "success", email: emailToShare })
          }
        })
        .catch(err => {
          console.log(err);
          resolve({ status: "fail", email: emailToShare })
        })
    }))
  })
  return promiseArray
}

const getDealInfoByEmailAndDealId = (userEmail, senderEmail, dealId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const senderUserData = await User.instance.findOne({ email: senderEmail })
      const dealData = senderUserData?.deals?.filter((deal) => String(deal._id) == dealId)[0]
      console.log("resolved")
      if (!dealData?.dealInfo?.isDealPrivate || dealData?.sharedTo?.includes(userEmail)) {
        console.log("resolved", { status: "success", dealData })
        dealData.dealInfo.sharedBy = senderUserData.username
        resolve({ status: "success", dealData })
      } else if (dealData?.dealInfo?.isDealPrivate) {
        console.log("resolved", { status: "fail deal private", userEmail, dealData })
        resolve({ status: "fail", message: "deal is private" })
      } else {
        console.log("resolved", { status: "fail something" })
        resolve({ status: "fail", message: "something went wrong" })
      }
    } catch (err) {
      console.log("error123", err)
      resolve({ status: "fail", message: "something went wrong" })
    }
  }
  )

}

const getDeleteSharedDealPromise = (sharedToEmail, dealId) => {
  return new Promise((resolve, reject) => {
    User.instance.updateOne({ email: sharedToEmail }, { $pull: { sharedDeals: { dealId: dealId } } })
      .then(res => { resolve({ status: 'success' }) }).catch(err => resolve({ status: 'fail' }))
  })
}