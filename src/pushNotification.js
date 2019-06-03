let pushNotification = require('node-pushnotifications');

let expo_sdk = require('expo-server-sdk');

let Expo = expo_sdk.Expo;

// Create a new Expo SDK client
let expo = new Expo();

const MSG_TITLE = '아침 문자';
const CHANNEL_ID = 'Hangil_Notification_Channel';


let generateMessage = (token, msg, data) => {

    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    let message = {
        to: token,            // An Expo push token specifying the recipient of this message.
        title: MSG_TITLE,     // The title to display in the notification.
        sound: 'default',     // A sound to play when the recipient receives this notification. Either default or null
        body: msg,            //The message to display in the notification
        data: data,           // A JSON object delivered to your app. It may be up to about 4KiB. If the data size is larger than 4KiB, "Message Too Big" error might be occurred.
        priority: 'high',     // The delivery priority of the message. Should be one of 'high', 'normal' and 'default'.
        channelID: CHANNEL_ID // ID of the Notification Channel through which to display this notification on Android devices.
    };

    return message;
}

let generatePushNotifications = (messages) => {
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    // Send the chunks to the Expo push notification service.
    // There are different strategies you could use.
    // A simple one is to send one chunk at a time, which nicely spreads the load out over time.
    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);

            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
        } catch (error) {
            console.error(error);
        }
    }

    //
}