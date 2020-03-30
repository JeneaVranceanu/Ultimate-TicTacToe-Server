class SocketConnectionManager {
    private connected = false;
    private socket: WebSocket;

    constructor() {

    }

    /** Interfaces */
    public connect(room: string, name: string) {
        if (!this.connected) {
            console.log('Init ws connection');
            console.log("Room#: " + room);
            console.log("Name: " + name);
            var param = `${room}&${name}`;
            this.socket = new WebSocket(`ws://${location.hostname}:8080/chat/${param}`);

            this.socket.onopen = () => {
                this.connected = true;
                console.log("Connected to the web socket");
            };

            /** Parse message 3 types - start, player turn, player win */
            // this.socket.onmessage = wsOnMessageListener;
            this.socket.onclose = (ev: CloseEvent) => {
                console.log(`Socket closed because: ${ev.reason}`);
            };
        }
    }

    public disconnect() {
        this.connected = false;
        if (this.socket) {
            this.socket.close();
            delete this.socket;
        }
    }

    /**
     * Sets message listener. If socket is null | undefined
     * this method has no effect.
     */
    public setMessageListener(listener: (ev: MessageEvent) => any) {
        if (this.socket) {
            this.socket.onmessage = listener;
        }
    }

    /** Dependencies */

    // var setWsOnMessageListener = (onMessageListener) => {
    //     wsOnMessageListener = onMessageListener;
    // }

    // var setWsOnCloseListener = (onCloseListener) => {
    //     wsOnCloseListener = onCloseListener;
    // }
}