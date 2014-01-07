// Initialize
var socket = io.connect(window.location.origin);

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
function send(message) {
    socket.emit('clientMessage', {
        message: message,
        type: 'chat-me'
    });
}

(function() {
    var msgTypes = {
        'chat-me'       : function(message) { showChat(message, 'me') },
        'chat-other'    : function(message) { showChat(message, 'other') },
        'alert-normal'  : function(message) { showAlert(message, 'normal') },
        'alert-red'     : function(message) { showAlert(message, 'red') },
        'alert-green'   : function(message) { showAlert(message, 'green') }
    };

    socket.on('serverMessage', function(data) {
        var show = msgTypes[data.type];
        show(data.message);
    });
})();
