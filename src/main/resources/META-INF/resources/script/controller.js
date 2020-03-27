var messagePrinter;

/** Interfaces */

var cnInitConnection = (room, name) => {
    console.log('initConnection', room, name);
    wsConnection(room, name);
}

var cnCloseConnection = () => {
    wsClose();
}

var cnMessageListener = (message) => {
    console.log('Message received');
    console.log(message.data);
    messagePrinter(message.data);
}

var cnCloseListener = (message) => {
    console.log('Connection closed');
    console.log(message.data);
    messagePrinter(message.data);
}

/** Dependencies */

var setCnMessagePrinter = (vMessagePrinter) => {
    messagePrinter = vMessagePrinter;
}