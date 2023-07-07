const { validationResult } = require("express-validator");
const { Website } = require("#models/Websites.js");
const { Member } = require("#models/Members.js");
const { VerifyDns } = require("#middlewares/tools.js");
const { generateWebsite, generateWebsiteFrontData } = require("#models/appWriteWebsites.js")
const sdk = require('node-appwrite');
const databases = require("#middlewares/appwrite.js")

exports.createWebsite = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));
    
    const { memberId, components, meta, route } = req.body;


    //for mongodb
    // const count = await Website.count({ route });
    // if (count > 0) throw new Error("Subdomain already exists");    
    // let newWebsite = {
    //   route,
    //   components,
    //   meta,
    // };
    // if (memberId) {
    //   newWebsite.memberId = memberId;
    //   newAppWriteWebsiteData.memberId = memberId;
    //   const user = await Member.findOne({ _id: memberId });
    //   if (user.services.website.units === 1) {
    //     const webArr = await Website.find({ memberId });
    //     if (webArr.length > 0) {
    //       newWebsite.isPremium = true;
    //       newWebsite.subscriptionId = webArr[0].subscriptionId;
    //       newWebsite.premiumStartDate = webArr[0].premiumStartDate;
    //     } else {
    //       await Member.findOneAndUpdate(
    //         { _id: memberId },
    //         {
    //           $set: {
    //             "services.website.units": 0,
    //           },
    //         },
    //       );
    //     }
    //   }
    // }
    // const website = new Website(newWebsite);
    // const result = await website.save();

    // appWrite 
    const countAppWrite = await databases.listDocuments(
      '649943eabc8caa275f19',
      '64994436db28fb95e9be', 
      [
        sdk.Query.equal('route', route)
      ])
  
    if (countAppWrite.total > 0) throw new Error("Subdomain already exists");
    let newAppWriteWebsiteData = generateWebsite("", components, meta, route )
 
    if (memberId) {
    newAppWriteWebsiteData.memberId = memberId;
    const user_AppWrite = await databases.getDocument(
        '649943eabc8caa275f19',
        '6499441590fe42913f3e', 
        memberId)

    if (user_AppWrite.services_website_units === 1){
      const webArr =  await databases.listDocuments(
        '649943eabc8caa275f19',
        '64994436db28fb95e9be', 
        [
          sdk.Query.equal('memberId', memberId)
        ])
    
        if (webArr.total > 0) {

          newAppWriteWebsiteData.isPremium = true;
          newAppWriteWebsiteData.subscriptionId = webArr.documents[0].subscriptionId;
          newAppWriteWebsiteData.premiumStartDate = webArr.documents[0].premiumStartDate;
        } else {
    
          user_AppWrite.services_website_units = 0;
          await databases.updateDocument(
            '649943eabc8caa275f19',
            '6499441590fe42913f3e', 
            memberId,
            user_AppWrite
          )
        }
    }
  }
    const result_AppWrite  =  await databases.createDocument(
      '649943eabc8caa275f19',
      '64994436db28fb95e9be', 
      sdk.ID.unique(),
      newAppWriteWebsiteData
      )

    res.status(200).json(result_AppWrite);
  } catch (err) {
    next(err);
  }
};

exports.deleteWebsite = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId } = req.body;
   
    const result = await databases.deleteDocument(
      '649943eabc8caa275f19',
      '64994436db28fb95e9be', 
      websiteId
      )
    // mongodb
    // const result = await Website.deleteOne({ _id: websiteId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getWebsiteByRoute = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { route } = req.query;

    //mongodb
    // const result = await Website.findOne({ route });
    let result =  await databases.listDocuments(
      '649943eabc8caa275f19',
      '64994436db28fb95e9be', 
      [
        sdk.Query.equal('route', route)
      ])

    result = generateWebsiteFrontData(result.documents[0])

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getWebsiteByDomain = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
  
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { domain } = req.query;
    
    // mongodb
    // const result = await Website.findOne({ "custom.domain": domain });
    let result =  await databases.listDocuments(
      '649943eabc8caa275f19',
      '64994436db28fb95e9be', 
      [
        sdk.Query.equal('custom_domain', domain)
      ])
    result = generateWebsiteFrontData(result);
    
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getWebsites = async (req, res, next) => {
 
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { memberId } = req.query;
    const countAppWrite = await databases.listDocuments(
       '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
       [
         sdk.Query.equal('memberId', memberId)
       ])
   
    let result = [];
    if(countAppWrite.total>0){
     result = countAppWrite.documents.map((document) => {
      return generateWebsiteFrontData(document)
    }
    )} 
    // mongodb
    //  const result = await Website.find({ memberId });
    
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

//unuse function 
exports.updateData = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, data } = req.body;

    const result = await Website.findOneAndUpdate(
      { _id: websiteId },
      {
        $set: {
          data,
        },
      },
      {
        new: true,
      },
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateIsPremium = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, isPremium } = req.body;
   
    //mongodb
    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       isPremium,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {isPremium : isPremium}
    )
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateIsExpired = async (req, res, next) => {
  
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, isExpired } = req.body;
   

    //mongodb
    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       isExpired,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    
    //appWrite 
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {isExpired : isExpired}
    )

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateIsPublished = async (req, res, next) => {
  
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, isPublished } = req.body;
   
    // mongodB
    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       isPublished,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );

    //appWrite 
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {isPublished  : isPublished }
    )
   
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updatePremiumStartDate = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, premiumStartDate } = req.body;
   
    //mongodb
    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       premiumStartDate,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );

    //appWrite
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {premiumStartDate  : premiumStartDate }
    )
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateRevealDate = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, revealDate } = req.body;

    //mongodb
    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       revealDate,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    //appWrite 
    let result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {revealDate  : revealDate }
    )
    result = generateWebsiteFrontData(result);
  
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateRoute = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, route } = req.body;
 
    //mongodb
    // const count = await Website.count({ route });

    // if (count > 0) throw new Error("Subdomain already exists");

    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       route,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    
    //appWrite
    const countRoute = await databases.listDocuments(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be',
       [sdk.Query.equal("route", route)]
    )

    if (count > 0) throw new Error("Subdomain already exists");
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {route : route }
    )
  
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateTitle = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, title } = req.body;


    // mongodb
    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       "components.title": title,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );

    //appWrite 
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {components_title : title }
    )

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateDescription = async (req, res, next) => {
 
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, description } = req.body;

    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       "components.description": description,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {components_description : description }
    )
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateLogo = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, logo } = req.body;

    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       "components.unrevealedImage": logo,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {components_unrevealedImages: logo }
    )

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateScript = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, script } = req.body;

    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       "components.script": script,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {components_script: script }
    )

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateEmbed = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, embed } = req.body;

    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       "components.embed": embed,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {components_embed: embed }
    )
  
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.addAddon = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, addon } = req.body;
   
    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $push: {
    //       "components.addons": addon,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );

    let websiteData = await databases.getDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId
    )
    websiteData.components_addons.push(addon)
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        websiteData
    )
  
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteAddon = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, addon } = req.body;
  
    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $pull: {
    //       "components.addons": addon,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    let websiteData = await databases.getDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId
    )
    websiteData.components_addons.pop(addon)
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        websiteData
    )

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateTemplate = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, template } = req.body;
  
    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       "components.template": template,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {components_template: template}
    )
  
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateRobot = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, robot } = req.body;

    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       "meta.robot": robot,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {meta_robot: robot}
    )

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateFavicon = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, favicon } = req.body;

    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       "meta.favicon": favicon,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {meta_favicon: favicon}
    )

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateLanguage = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, language } = req.body;

    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       "meta.language": language,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        {meta_language : language}
    )
  
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateExternalLink = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, social, link } = req.body;
 
    // const result = await Website.findOneAndUpdate(
    //   { _id: websiteId },
    //   {
    //     $set: {
    //       [`externalLinks.${social}`]: link,
    //     },
    //   },
    //   {
    //     new: true,
    //   },
    // );

    let websiteData = await databases.getDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId
    )
    websiteData[`externalLinks.${social}`] = link;
    const result = await databases.updateDocument(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
        websiteId,
        websiteData 
    )

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
// not complete
exports.updateDomain = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { websiteId, domain } = req.body;

    const verification = await VerifyDns(domain);
    if (!verification.status) throw new Error(verification.message);

    // this only add example.com not www.example.com
    const domainRes = await fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
      {
        body: `{\n  "name": "${domain}"\n}`,
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    const domainData = await domainRes.json();

    if (domainData.error) {
      throw new Error(domainData.error.message);
    }

    if (!domainData.verified)
      throw new Error("Make sure your domain uses right nameservers.");

    const domainCount = await Website.count({ "custom.domain": domain });
    if (domainCount > 0) throw new Error("Domain already used.");

    const result = await Website.findOneAndUpdate(
      { _id: websiteId },
      {
        $set: {
          "custom.domain": domain,
        },
      },
      {
        new: true,
      },
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.verifyDomain = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { domain } = req.body;

    const result = await VerifyDns(domain);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateSubscription = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const {
      memberId,
      subscriptionId,
      isPremium,
      isExpired,
      isPublished,
      premiumStartDate,
      premiumEndDate,
    } = req.body;

    let userWebsiteData = await databases.listDocuments(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
       [
        sdk.Query.equal('memberId', memberId)
      ]
    )
    
    // let userWebsites = await Website.find({ memberId });
    const userWebsitesIdArr = userWebsiteData.documents.map((document) => document.$id);

    for (let x = 0 ; x < userWebsitesIdArr.length; x++){
      const result = await databases.updateDocument(
        '649943eabc8caa275f19',
         '64994436db28fb95e9be', 
         userWebsitesIdArr[x],
          {
            subscriptionId : subscriptionId,
            isPremium: isPremium,
            isExpired: isExpired,
            isPublished: isPublished,
            premiumStartDate: premiumStartDate,
            premiumEndDate: premiumEndDate
          }
      )
    }

    // mongodb
    // await Website.updateMany(
    //   {
    //     _id: {
    //       $in: userWebsitesIdArr,
    //     },
    //   },
    //   {
    //     $set: {
    //       subscriptionId,
    //       isPremium,
    //       isExpired,
    //       isPublished,
    //       premiumStartDate,
    //       premiumEndDate,
    //     },
    //   },
    // );

//mongodb
    // if (isExpired) {
    //   await Member.findOneAndUpdate(
    //     { _id: memberId },
    //     {
    //       $set: {
    //         "services.website.units": 0,
    //       },
    //     },
    //   );
    // }
    if (isExpired) {
    await databases.updateDocument(
      '649943eabc8caa275f19',
       '6499441590fe42913f3e', 
       memberId,
        {
          services_website_units : 0,
        }
    )
      }

    // userWebsites = await Website.find({ memberId });
    let result = await databases.listDocuments(
      '649943eabc8caa275f19',
       '64994436db28fb95e9be', 
       [
        sdk.Query.equal('memberId', memberId)
      ]
    )
   
    result = result.documents.map((document) => {
      return generateWebsiteFrontData(document);
    })

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getMappedSubdomains = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const websites = await Website.find({
      route: {
        $exists: true,
        $ne: "",
      },
    });
    const websites_app = await databases.listDocuments(
    '649943eabc8caa275f19',
    '64994436db28fb95e9be',
    [
      sdk.Query.notEqual("route", [""])
    ]
    );

    

    const mappedSubdomains = websites.map((web) => {
      return { params: { siteRoute: web.route } };
    });

    const mappedSubdomains_app = websites_app.documents.map((document) => {
      return { params: { siteRoute: document.route } };
    });
  
    res.status(200).json(mappedSubdomains_app );
  } catch (err) {
    next(err);
  }
};
