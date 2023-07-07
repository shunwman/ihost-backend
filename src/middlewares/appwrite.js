const sdk = require('node-appwrite');

let client = new sdk.Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
    .setProject(process.env.APPWRITE_PROJECT) // Your project ID
    .setKey(process.env.APPWRITE_KEY) // Your secret API key
    .setSelfSigned() 
    //  Use only on dev mode with a self-signed SSL cert
;

let databases = new sdk.Databases(client)

module.exports = databases;