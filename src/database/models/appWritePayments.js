module.exports.generatePayment = (memberId, hash, service, price) => {
    if (!memberId && !hash && !service && !price) {
        return false;
    }
    let newPayment = {
        memberId : memberId,
        hash : hash,
        service : service, 
        price: price,
        isCanceled: false
    }
    return newPayment 

}

module.exports.generatePaymentFrontEnd = (appWriteData) => {
    let frontEndData  = {
        _id : appWriteData.$id,
        memberId : appWriteData.memberId,
        hash : appWriteData.hash,
        service : appWriteData.service,
        price : appWriteData.price,
        isCanceled : appWriteData.isCanceled,
        createdAt : appWriteData.$createdAt,
        updatedAt : appWriteData.$updatedAt
    }
    return frontEndData
}