const admin = require('firebase-admin');

let serviceAccount;

if (process.env.FIREBASE_CONFIG) {
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
  serviceAccount = require('../../tasehatwalafiat-firebase-adminsdk-fbsvc-96b3dbb4d6.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
