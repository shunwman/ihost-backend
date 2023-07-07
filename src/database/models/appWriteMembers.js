// let defaultMembers =  {
//     address: "",
//     wallet: "",
//     email: "",
//     picture: "https://www.nfthost.app/assets/logo.png",
//     isBanned: false,
//     customerId: "none",
//     services_generator_units: 0,
//     services_website_units: 0,
//     services_utils_units:0
//   }
// import data to appWrite databases 
module.exports.generateMember = (address, wallet, email = "", picture = "https://www.nfthost.app/assets/logo.png", isBanned = false, customerId = "none", services_generator_units = 0, services_website_units = 0, services_utils_units = 0) => {
    if (!address && !wallet) {
        return false;
    }
    let member = {
        address : address,
        wallet : wallet,
        email : email,
        picture : picture,
        isBanned : isBanned,
        customerId : customerId,
        services_generator_units: services_generator_units,
        services_website_units: services_website_units,
        services_utils_units: services_utils_units
    }
    return member;
}
//convert the data format to  be suitable for front end 
module.exports.generateFrontEndMember = (   _id,
                                            address, 
                                            wallet, 
                                            email = "", 
                                            picture = "https://www.nfthost.app/assets/logo.png", 
                                            isBanned = false, 
                                            customerId = "none", 
                                            services_generator_units = 0, 
                                            services_website_units = 0, 
                                            services_utils_units = 0,
                                            createdAt,
                                            updatedAt,
                                            __v= 0
                                            ) => {
    if (!address && !wallet && !_id) {
        return false;
    }
    let member = {
        _id: _id,
        address : address,
        wallet : wallet,
        email : email,
        picture : picture,
        isBanned : isBanned,
        customerId : customerId,
        createdAt: createdAt,
        updatedAt: updatedAt,
        services: {
            generator: { units: services_generator_units },
            website: { units: services_website_units },
            utils: { units: services_utils_units }
          },
        __v: __v,
    }
    return member;

}