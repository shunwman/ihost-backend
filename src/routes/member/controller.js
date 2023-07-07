const {
  generateAccessToken,
  generateRefreshToken,
} = require("#middlewares/jwt.js");
const { validationResult } = require("express-validator");
const { Member } = require("#models/Members.js");
const { Payment } = require("#models/Payments.js");
const { Website } = require("#models/Websites.js");
const { Token } = require("#models/Tokens.js");
const { generateMember, generateFrontEndMember } = require("#models/appWriteMembers.js")
const sdk = require('node-appwrite');
const databases = require("#middlewares/appwrite.js")
const jwt = require("jsonwebtoken");
//almost ok
exports.walletLogin = async (req, res, next) => {
  try {
    console.log("|walletLogin|")
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { address, wallet } = req.body;
    let memberObject = generateMember(address, wallet);
    const userCount = await Member.count({ address });
    let newMember = {
      address,
      wallet,
    };
    const checkDoc = await databases.listDocuments(
      '649943eabc8caa275f19',
      '6499441590fe42913f3e', 
      [
        sdk.Query.equal('address', address)
      ])
    //mongodb
    if (!userCount) {
      const member = new Member(newMember);
      await member.save();
    }
    //appWrite
    if (checkDoc.total === 0){ 
      await databases.createDocument(
         '649943eabc8caa275f19',
         '6499441590fe42913f3e', 
         sdk.ID.unique(),
         memberObject
       )
     }
    const memberData = { address, wallet };
    const accessToken = generateAccessToken(memberData);
    const refreshToken = generateRefreshToken(memberData);
  
    const tokenCount = await Token.findOne({ address });
    const tokenCount_appWrite = await databases.listDocuments(
      '649943eabc8caa275f19',
      '6499442c6b747aee0aa3', 
      [
        sdk.Query.equal('address', address)
      ])
    const newToken = new Token({
      address,
      refreshToken,
    });

    //mongodb
    if (!tokenCount) {
      await newToken.save();
 
    }
    else
      await Token.updateOne(
        { address },
        {
          $set: {
            refreshToken,
          },
        },
      );
      //appWrite
      if (tokenCount_appWrite.total === 0) {
        await databases.createDocument(
          '649943eabc8caa275f19',
          '6499442c6b747aee0aa3', 
          sdk.ID.unique(),
          {address : address,  refreshToken : refreshToken}
        )
      }
      else{
        await databases.updateDocument(
          '649943eabc8caa275f19',
          '6499442c6b747aee0aa3', 
          tokenCount_appWrite.documents[0].$id,
          {address : address,  refreshToken : refreshToken}
        )
  }
    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};
//seem ok 
exports.getMemberByAddress = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { address } = req.query;
    const member = await Member.findOne({ address });
  
    const checkDoc = await databases.listDocuments(
      '649943eabc8caa275f19',
      '6499441590fe42913f3e', 
      [
        sdk.Query.equal('address', address)
      ])
    //console.log("checkDoc: ", checkDoc)
    const member_app = generateFrontEndMember(
      checkDoc.documents[0].$id,
      checkDoc.documents[0].address,
      checkDoc.documents[0].wallet,
      checkDoc.documents[0].email, 
      checkDoc.documents[0].picture,
      checkDoc.documents[0].isBanned,
      checkDoc.documents[0].customerId,
      checkDoc.documents[0].services_generator_units,
      checkDoc.documents[0].services_website_units,
      checkDoc.documents[0].services_utils_units,
      checkDoc.documents[0].$createdAt,
      checkDoc.documents[0].$updatedAt
    )
    //console.log("member_app: ", member_app)
    // res.status(200).json(member);
    res.status(200).json(member_app);
  } catch (err) {
    next(err);
  }
};
// need test 
exports.addUnit = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { address, service } = req.body;
    // mongodb
    // const result = await Member.findOneAndUpdate(
    //   { address },
    //   {
    //     $inc: {
    //       [`services.${service}.units`]: 1,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    // AppWrite 
    const checkDoc = await databases.listDocuments(
      '649943eabc8caa275f19',
      '6499441590fe42913f3e', 
      [
        sdk.Query.equal('address', address)
      ])
      
      checkDoc.documents[0][`services_${service}_units`]++;
    let newMember = generateMember(
      checkDoc.documents[0].address,
      checkDoc.documents[0].wallet, 
      checkDoc.documents[0].email,
      checkDoc.documents[0].picture,
      checkDoc.documents[0].isBanned,
      checkDoc.documents[0].customerId,
      checkDoc.documents[0].services_generator_units,
      checkDoc.documents[0].services_website_units,
      checkDoc.documents[0].services_utils_units,
    )

    const updateDoc = await databases.updateDocument(
      '649943eabc8caa275f19',
      '6499441590fe42913f3e', 
      checkDoc.documents[0].$id,
      newMember
    )
    newMember = generateFrontEndMember(newMember)

    res.status(200).json(newMember);
  } catch (err) {
    next(err);
  }
};
// need test 
exports.deductUnit = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { address, service } = req.body;
    //mongodb
    // const result = await Member.findOneAndUpdate(
    //   { address },
    //   {
    //     $inc: {
    //       [`services.${service}.units`]: -1,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
        // AppWrite 
        const checkDoc = await databases.listDocuments(
          '649943eabc8caa275f19',
          '6499441590fe42913f3e', 
          [
            sdk.Query.equal('address', address)
          ])
          checkDoc.documents[0][`services_${service}_units`]--;
        let newMember = generateMember(
          checkDoc.documents[0].address,
          checkDoc.documents[0].wallet,
          checkDoc.documents[0].email,
          checkDoc.documents[0].picture,
          checkDoc.documents[0].isBanned,
          checkDoc.documents[0].customerId,
          checkDoc.documents[0].services_generator_units,
          checkDoc.documents[0].services_website_units,
          checkDoc.documents[0].services_utils_units,
        )
        const updateDoc = await databases.updateDocument(
          '649943eabc8caa275f19',
          '6499441590fe42913f3e', 
          checkDoc.documents[0].$id,
          newMember
        )

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
//need update 
exports.updateEmail = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { memberId, email, address } = req.body;
    //mongodb
    // const result = await Member.findOneAndUpdate(
    //   { _id: memberId },
    //   {
    //     $set: {
    //       email,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    //appWrite
    const checkDoc = await databases.listDocuments(
      '649943eabc8caa275f19',
      '6499441590fe42913f3e', 
      [
        sdk.Query.equal('address', address)
      ])
     
      let newMember = generateMember(
        checkDoc.documents[0].address,
        checkDoc.documents[0].wallet,
        email,
        checkDoc.documents[0].picture,
        checkDoc.documents[0].isBanned,
        checkDoc.documents[0].customerId,
        checkDoc.documents[0].services_generator_units,
        checkDoc.documents[0].services_website_units,
        checkDoc.documents[0].services_utils_units,
      )
      const updateDoc = await databases.updateDocument(
        '649943eabc8caa275f19',
        '6499441590fe42913f3e', 
        checkDoc.documents[0].$id,
        newMember
      )

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
//ok
exports.logout = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { refreshToken } = req.body;
    // mongodb
    const result = await Token.deleteOne({ refreshToken });
    // appWrite 
    const checkDoc = await databases.listDocuments(
      '649943eabc8caa275f19',
      '6499442c6b747aee0aa3', 
      [
        sdk.Query.equal('refreshToken', refreshToken)
      ])
    await databases.deleteDocument(
      '649943eabc8caa275f19',
      '6499442c6b747aee0aa3', 
      checkDoc.documents[0].$id
    )
    res.status(204).json(result);
  } catch (err) {
    next(err);
  }
};

exports.renewToken = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { refreshToken } = req.body;
    //mongodb
    const tokenCount = await Token.count({ refreshToken });  
    //appWrite 
    const checkDoc = await databases.listDocuments(
      '649943eabc8caa275f19',
      '6499442c6b747aee0aa3', 
      [
        sdk.Query.equal('refreshToken', refreshToken)
      ])
    const tokenCount_appWrite = checkDoc.documents[0].total
      //mongodb
    if (!tokenCount) {
      return res.status(403).json({ message: "Cannot fetch refresh token" });
    }
      //appWrite 
    if (tokenCount_appWrite === 0) {
      return res.status(403).json({ message: "Cannot fetch refresh token" });
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const accessToken = generateAccessToken({
        address: data.address,
        wallet: data.wallet,
      });

      res.json({ accessToken: accessToken });
    });
  } catch (err) {
    next(err);
  }
};
// wait to all complete 
exports.delete = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { memberId } = req.body;
    await Payment.deleteMany({ memberId });
    await Website.deleteMany({ memberId });
    const result = await Member.deleteOne({ _id: memberId });

    if (!result) throw new Error("Cannot delete user at the moment");

    res.status(204).json({ message: "Successfully deleted user" });
  } catch (err) {
    next(err);
  }
};
