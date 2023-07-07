const { validationResult } = require("express-validator");
const { Payment } = require("#models/Payments.js");
const { Member } = require("#models/Members.js");
const config = require("#config/index.js");
const Stripe = require("stripe");
const sdk = require('node-appwrite');
const databases = require("#middlewares/appwrite.js")
const stripe = new Stripe(process.env.STRIPE_SECRET);
const  { generatePayment, generatePaymentFrontEnd } = require("#models/appWritePayments.js")
exports.requestSubscription = async (req, res, next) => {

  const stripe = new Stripe(process.env.STRIPE_SECRET);
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { service, billingDetails, customerId, metadata } = req.body;

    let customer;
    if (customerId !== "none") {
      customer = await stripe.customers.retrieve(customerId);
    } else if (customerId === "none") {
      customer = await stripe.customers.create({
        name: billingDetails.name,
        email: billingDetails.email,
        address: billingDetails.address,
        metadata,
      });
   
    //mongodb
      // await Member.findOneAndUpdate(
      //   { address: metadata.walletAddress },
      //   {
      //     $set: {
      //       customerId: customer.id,
      //     },
      //   },
      // );
      const userData = await databases.listDocuments(
        '649943eabc8caa275f19',
        "6499441590fe42913f3e",
        [sdk.Query.equal("address" , metadata.walletAddress)]
      )
     const newResult =  await databases.updateDocument(
        '649943eabc8caa275f19',
        "6499441590fe42913f3e",
        userData.documents[0].$id,
       {customerId : customer.id}
      )

    }
   
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: config.stripe.products[service].priceId,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (err) {
    next(err);
  }
};

exports.requestPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { billingDetails, amount, customerId, metadata } = req.body;

    let customer;
    if (customerId !== "none") {
      customer = await stripe.customers.retrieve(customerId);
    } else if (customerId === "none") {
      customer = await stripe.customers.create({
        name: billingDetails.name,
        email: billingDetails.email,
        address: billingDetails.address,
        metadata,
      });
      //mongodb
      // await Member.findOneAndUpdate(
      //   { address: metadata.walletAddress },
      //   {
      //     $set: {
      //       customerId: customer.id,
      //     },
      //   },
      // );
    const userData = await databases.listDocuments(
      '649943eabc8caa275f19',
      "6499441590fe42913f3e",
      [sdk.Query.equal("address" , metadata.walletAddress)]
    )
    await databases.updateDocument(
      '649943eabc8caa275f19',
      "6499441590fe42913f3e",
      userData.documents[0].$id,
     {customerId : customer.id}
    )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      receipt_email: billingDetails.email,
      customer: customer.id,
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    next(err);
  }
};

exports.addPayment = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

  
    const { memberId, hash, service, price } = req.body;
 
    const newPayment = {
      memberId,
      hash,
      service,
      price,
    };
  //mongodb 
  // const payment = new Payment(newPayment);

  // const result = await payment.save({ ordered: false });
  let newAppPayment = generatePayment(memberId, hash, service, price)
  const result =  await databases.createDocument(
    '649943eabc8caa275f19',
    '64994423100296362bef', 
    sdk.ID.unique(),
    newAppPayment
    )
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPayments = async (req, res, next) => {

  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { memberId, pageNumber } = req.query;
   
    const page = parseInt(pageNumber);

    // mongodb
    // const resultCount = await Payment.count({ memberId });
    // const result = await Payment.find({ memberId })
    //   .sort({ createdAt: "desc" })
    //   .skip(page * 5)
    //   .limit(5);
    // 
    let resultCount = await databases.listDocuments(
      '649943eabc8caa275f19',
      '64994423100296362bef', 
      [
        sdk.Query.equal("memberId", [memberId]),
      ])
    resultCount = resultCount.total

    const result = await databases.listDocuments(
      '649943eabc8caa275f19',
      '64994423100296362bef', 
      [
        sdk.Query.equal("memberId", [memberId]),
        sdk.Query.offset(page * 5),
        sdk.Query.orderAsc("$createdAt"),
        sdk.Query.limit(5),
      ])

    const pageCountPartial = parseFloat(resultCount.total / 5);
    const isWholeNumber = pageCountPartial % 1 === 0.5;
    const finalPageCount = Math.trunc(pageCountPartial) + 1;
    const frontEndData = result.documents.map((document)=> {
      return generatePaymentFrontEnd(document);
    })
    const data = {
      payments: frontEndData,
      totalItems: resultCount.total,
      totalPages: isWholeNumber ? pageCountPartial : finalPageCount,
      currentPage: page,
    };

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.getSubscriptions = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { customerId } = req.query;

    const customer = await stripe.customers.retrieve(customerId, {
      expand: ["subscriptions"],
    });

    const subscriptions = customer.subscriptions.data;

    res
      .status(200)
      .json(subscriptions.filter((sub) => sub.cancel_at_period_end === false));
  } catch (err) {
    next(err);
  }
};

exports.cancelSubscription = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { subscriptionId } = req.body;

    const result = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getSubscription = async (req, res, next) => {
  try {
    const errors = validationResult(req).array();
    if (errors.length > 0)
      throw new Error(errors.map((err) => err.msg).join(", "));

    const { subscriptionId } = req.query;

    const result = await stripe.subscriptions.retrieve(subscriptionId);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
