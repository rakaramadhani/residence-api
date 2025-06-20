const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

let serviceAccount;

if (process.env.FIREBASE_CONFIG) {
  try {
    console.log('🔑 FIREBASE_CONFIG found in env');

    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

    // Penting: ganti \\n menjadi newline sebenarnya
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

    console.log('✅ Firebase service account loaded from env');
  } catch (error) {
    console.error('❌ Error parsing FIREBASE_CONFIG:', error.message);
  }
} else {
  console.error('❌ FIREBASE_CONFIG not found in environment variables');

  // Optional fallback (disable if deploying to Railway)
  // serviceAccount = require('../../tasehatwalafiat-firebase-adminsdk-fbsvc-96b3dbb4d6.json');
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('🚀 Firebase admin initialized');
} else {
  console.error('🛑 Firebase admin NOT initialized — serviceAccount is undefined');
}

module.exports = admin;

