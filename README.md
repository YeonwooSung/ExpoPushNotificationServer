# ExpoPushNotificationServer
Simple server to get the token data from the react native app for the expo push notification.

## Overview

This server sends a push notification to an expo app.
Basically, this server writes a pair of a push token and an id in the csv file.
And, it reads the csv file to get the push tokens when it needs to send a push notification.

## Format of the POST request

### token - store push token

POST /token

```javascript
{
    "data" : {
        "id" : "id_string",
        "token" : "expo push token"
    }
}
```


### notification - send push notification

POST /notification

```javascript
{
    "id": ["id_string1", "id_string2", ...],
    "message" : {
        "title" : "message title",
        "body" : "message body"
    }
}
```
