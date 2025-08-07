const functions = require("firebase-functions");
const admin = require("firebase-admin");
const apn = require('@parse/node-apn');
const fs = require("fs");
const path = require("path");

admin.initializeApp();

// APNs configuration for VoIP
const voipOptions = {
  token: {
    key: fs.readFileSync(path.join(__dirname, "AuthKey_VPS5KKYXCC.p8")),
    keyId: "VPS5KKYXCC", // Your Key ID from Apple Developer portal
    teamId: "QPKF6HP9US", // Your Apple Developer Team ID
  },
  production: false, // Change to true for production
};

const apnProvider = new apn.Provider(voipOptions);

exports.sendVoipNotification = functions.https.onCall(async (data, context) => {
  const {deviceToken, payloadData} = data;

  if (!deviceToken) {
    throw new functions.https.HttpsError("invalid-argument", "Device token is required");
  }

  const notification = new apn.Notification();

  notification.topic = "com.papacitos.app.voip"; // Use your bundle ID with `.voip`
  notification.pushType = "voip";
  notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour
  notification.priority = 10;
  notification.payload = payloadData || {};
  notification.aps = {"content-available": 1};

  try {
    const result = await apnProvider.send(notification, deviceToken);
    console.log("APNs result:", result);
    return {success: true, result};
  } catch (error) {
    console.error("Error sending VoIP notification:", error);
    throw new functions.https.HttpsError("internal", "Failed to send VoIP notification");
  }
});
