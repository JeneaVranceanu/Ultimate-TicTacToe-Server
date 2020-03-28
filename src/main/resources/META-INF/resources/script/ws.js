var connected = false;
var socket;
var wsOnMessageListener;
var wsOnCloseListener;

/** Interfaces */

var wsConnection = (room, name) => {
    if (!connected) {
        console.log('Init ws connection');
        console.log("Room#: " + room);
        console.log("Name: " + name);
        var param = `${room}&${name}`;
        socket = new WebSocket(`ws://${location.hostname}:8080/chat/${param}`);

        socket.onopen = () => {
            connected = true;
            console.log("Connected to the web socket");
        };

        /** Parse message 3 types - start, player turn, player win */
        socket.onmessage = wsOnMessageListener;
        socket.onclose = wsOnCloseListener;
    }
}

var wsClose = () => {
    if (connected) {
        console.log('Close ws connection');
        socket.close();
        connected = false;
    }
}

/** Dependencies */

var setWsOnMessageListener = (onMessageListener) => {
    wsOnMessageListener = onMessageListener;
}

var setWsOnCloseListener = (onCloseListener) => {
    wsOnCloseListener = onCloseListener;
}