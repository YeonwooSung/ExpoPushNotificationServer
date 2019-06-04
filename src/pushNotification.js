let pushNotification = require('node-pushnotifications');

const { Expo } = require('expo-server-sdk')

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

/**
 * Generate push notifications by making and sending message chunks.
 *
 * @param {List} messages A list of message objects.
 */
let generatePushNotifications = async (messages) => {
    /*
     * The Expo push notification service accepts batches of notifications so
     * that you don't need to send 1000 requests to send 1000 notifications. We
     * recommend you batch your notifications to reduce the number of requests
     * and to compress them (notifications with similar content will get compressed).
     */
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

    // Later, after the Expo push notification service has delivered the notifications 
    // to Apple or Google (usually quickly, but allow the the service up to 30 minutes when under load), 
    // a "receipt" for each notification is created. 
    // The receipts will be available for at least a day; stale receipts are deleted.
    let receiptIds = [];
    for (let ticket of tickets) {
        // NOTE: Not all tickets have IDs; for example, tickets for notifications
        // that could not be enqueued will have error information and no receipt ID.
        if (ticket.id) {
            receiptIds.push(ticket.id);
        }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    await retrieveBatchesOfReceipts(receiptIdChunks);
}

let retrieveBatchesOfReceipts = async (receiptIdChunks) => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
        try {
            let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            console.log(receipts);

            // The receipts specify whether Apple or Google successfully received the
            // notification and information about an error, if one occurred.
            for (let receipt of receipts) {
                if (receipt.status === 'ok') {
                    continue;
                } else if (receipt.status === 'error') {
                    console.error(`There was an error sending a notification: ${receipt.message}`);
                    if (receipt.details && receipt.details.error) {
                        // The error codes are listed in the Expo documentation:
                        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
                        // You must handle the errors appropriately.
                        console.error(`The error code is ${receipt.details.error}`);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports.generateMessage = generateMessage;
module.exports.generatePushNotifications = generatePushNotifications;