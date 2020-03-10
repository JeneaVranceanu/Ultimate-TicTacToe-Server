var connected = false;
var socket;

var wsConnection = (ip, name) => {
    if (!connected) {
        console.log('wsConnection');
        console.log("IP: " + ip, " Name: " + name);
        var param = `${ip}&${name}`;
        socket = new WebSocket(`ws://${location.host}/chat/${param}`);

        socket.onopen = () => {
            connected = true;
            console.log("Connected to the web socket");
        };

        /** Parse message 3 types - start, player turn, player win */
        socket.onmessage = (m) => {
            console.log("Got message: " + m.data);
            // $("#chat").append(m.data + "\n");
            // scrollToBottom();
            // startGame();
        };

        socket.onclose = (m) => {
            console.log('connection closed');
        }

    }
}