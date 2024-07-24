const firebase = require('firebase-admin');
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n");

exports.fire = firebase.initializeApp({
    credential: firebase.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      }),
    databaseURL: process.env.FIREBASE_DB_URL
});