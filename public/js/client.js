// Initialize
var socket = io.connect(window.location.origin);

// Data object contract
/**
 *  data = {
 *      message: "String"
 *  };
 */

// Send
function send(message) {
    socket.emit('clientMessage', { message: message });
}

(function() {
    socket.on('serverMessage', function(data) {
        console.log(data.message);
    });
})();
