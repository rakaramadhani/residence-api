const admin = require('../../firebase/firebase');

const sendNotification = async (req, res) => {
    const { title, body, token } = req.body;

    try {
        const message = {
            notification: {
                title: title,
                body: body,
            },
            token: token,
        };

        // Send a message to the device corresponding to the provided
        // registration token.
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        res.status(200).json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    sendNotification
}