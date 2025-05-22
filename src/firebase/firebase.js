const admin = require('firebase-admin');
const serviceAccount = require('../../tasehatwalafiat-firebase-adminsdk-fbsvc-96b3dbb4d6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
