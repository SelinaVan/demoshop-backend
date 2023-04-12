// Import the functions you need from the SDKs you need

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'shop24h-7d406.appspot.com' // replace <project_id> with your project ID
});

const bucket = admin.storage().bucket()

module.exports = {
    bucket
}