
// import data to appWrite databases 
// module.exports.generateWebsite = (memberId, isPremium,
//                                  isExpired, isPublished, 
//                                  premiumStartDate, premiumEndDate, 
//                                  revealDate, route, 
//                                  subscriptionI, components_title, 
//                                  components_unrevealedImage, components_embed,
//                                  components_script, components_addons,
//                                  template, meta_robot, meta_favicon,
//                                  meta_language, externalLinks_twitter,
//                                  externalLinks_instagram, externalLinks_youtube,
//                                  externalLinks_tiktok, externalLinks_discord,
//                                  externalLinks_reddit, externalLinks_facebook,
//                                  externalLinks_opensea, custom_domain) => {

module.exports.generateWebsite = (memberId, components, meta, route) => {
    if (!memberId && !components) {
        return false;
    }
    let newWebsite = {
        memberId : memberId,
        isPremium : false,
        isExpired : false,
        isPublished: false, 
        premiumStartDate: null,
        premiumEndDate : null,
        revealDate : null,
        route: route,
        subscriptionId: "",
        components_title: components.title,
        components_unrevealedImage: components.unrevealedImage,
        components_description: components.description,
        components_embed: components.embed,
        components_script: components.script,
        components_addons: [],
        components_template: "Template1",
        meta_robot: meta.robot,
        meta_favicon: meta.favicon,
        meta_language: meta.language, 
        externalLinks_twitter: "",
        externalLinks_instagram: ""  ,
        externalLinks_youtube: ""  ,
        externalLinks_tiktok: ""  ,
        externalLinks_discord: ""  ,
        externalLinks_reddit: ""  ,
        externalLinks_facebook: ""  ,
        externalLinks_opensea: "" ,
        custom_domain: ""
    }
    return newWebsite;
}
//convert the data format to  be suitable for front end 
module.exports.generateWebsiteFrontData = (appWriteData) => {
    let WebsiteFrontData  =  {
        _id : appWriteData.$id,
        memberId: appWriteData.memberId,
        isPremium: appWriteData.isPremium,
        isExpired: appWriteData.isExpired,
        isPublished: appWriteData.isPublished,
        premiumStartDate: appWriteData.premiumStartDate,
        premiumEndDate: appWriteData.premiumEndDate,
        revealDate: appWriteData.revealDate,
        route: appWriteData.route,
        subscriptionId: appWriteData.subscriptionId,
        createdAt : appWriteData.$createdAt,
        updatedAt : appWriteData.$updatedAt,
        components: {
          title: appWriteData.components_title,
          unrevealedImage: appWriteData.components_unrevealedImage,
          description: appWriteData.components_description,
          embed: appWriteData.components_embed,
          script: appWriteData.components_script,
          addons: appWriteData.components_addons,
          template: appWriteData.components_template,
        },
        meta: {
          robot: appWriteData.meta_robot,
          favicon: appWriteData.meta_favicon,
          language: appWriteData.meta_language,
        },
        externalLinks: {
          twitter: appWriteData.externalLinks_twitter,
          instagram: appWriteData.externalLinks_instagram  ,
          youtube:  appWriteData.externalLinks_youtube ,
          tiktok:   appWriteData.externalLinks_tiktok,
          discord:  appWriteData.externalLinks_discord,
          reddit:   appWriteData.externalLinks_reddit,
          facebook: appWriteData.externalLinks_facebook    ,
          opensea:  appWriteData.externalLinks_opensea ,
        },
        custom: {
          domain: appWriteData.custom_domain,
        },
      }
    return WebsiteFrontData;

}