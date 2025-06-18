const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

let serviceAccount;

if (process.env.FIREBASE_CONFIG) {
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

  // Penting: ganti \\n menjadi newline beneran
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
} else {
  serviceAccount = require('../../tasehatwalafiat-firebase-adminsdk-fbsvc-96b3dbb4d6.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;

