// Initialize
var socket = io.connect(window.location.origin);

// Disconnection
socket.on('disconnect', function () {
    dom.disconnected();
});

// Data object contract
/**
 *  data = {
 *      message: "chat string..",
 *      type: "chat-me" // chat-me or chat-other
 *  };
 *
 *  -- or --
 *
 *  data = {
 *      message: "alert string..",
 *      type: "alert-normal" // alert-normal or alert-red or alert-green
 *  };
 */

// Send chat
window.client = {};
window.client.send = function(message) {
    socket.emit('clientMessage', {
        message: message,
        type: 'chat-me'
    });
};

(function() {
    var msgTypes = {
        'chat-me'       : function(message) { dom.showChat(message, 'me') },
        'chat-other'    : function(message) { dom.showChat(message, 'other') },
        'alert-normal'  : function(message) { dom.showAlert(message, 'normal') },
        'alert-red'     : function(message) { dom.showAlert(message, 'red') },
        'alert-green'   : function(message) { dom.showAlert(message, 'green') }
    };

    socket.on('serverMessage', function(data) {
        var show = msgTypes[data.type];
        show(data.message);
    });
})();
