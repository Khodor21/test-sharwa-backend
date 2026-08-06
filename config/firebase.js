const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "sharwa-images-cloude.firebasestorage.app ",
});

const db = admin.firestore();
const auth = admin.auth();
const bucket = new Storage().bucket(admin.app().options.storageBucket);

module.exports = { db, auth, bucket };
