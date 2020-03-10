var sendMessage = (message) => {
	if (connected) {
		var value = $("#msg").val();
		socket.send(value);
		$("#msg").val("");
	}
};

setViewOnConnectListener(initConnection);
