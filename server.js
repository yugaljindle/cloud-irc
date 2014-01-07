// Imports
var sanitize = require('validator').sanitize;

module.exports = function(server) {
    var io = require('socket.io').listen(server);

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

    // Shared state
    var users = [],
        rooms = [
            'python_room',
            'javascript_room',
            'design_room'
        ];

    // Array helper
    Array.prototype.contains = function(k) {
        for(var p in this)
            if(this[p] === k)
                return true;
        return false;
    }

    // Respond
    function respond(socket, message, type) {
        socket.emit('serverMessage', {
            message : message,
            type    : type
        });
    }

    // Validate username
    function checkUsername(socket, username) {
        var msg,
            hasSpace = (username.indexOf(' ') !== -1);
        if(hasSpace) {
            msg = '`'+ username +'` : Username can-not contain space';
            respond(socket, msg, 'alert-red');
            return false;
        } else if(users.contains(username)) {
            msg = '`'+ username +'` : Username is already taken'; 
            respond(socket, msg, 'alert-red');
            return false;
        }
        return true;
    }

    // Connection
    io.sockets.on('connection', function(socket) {
        // Welcome message
        respond(socket, 'Welcome to cloud-irc !', 'alert-normal');
        respond(socket, 'Choose a username ?', 'alert-green');
        var username;
        // Receive from client
        socket.on('clientMessage', function(data) {
            var msg = sanitize(data.message).escape();
            if(!username && checkUsername(socket, msg)) {
                username = msg; 
                users.push(username);
                respond(socket, 'Username `'+ msg +'` granted !', 'alert-green');
                respond(socket, 'Checkout chat rooms with `/rooms`', 'alert-normal');
                return;
            }
            if(username) {
                // Acknowledge
                socket.emit('serverMessage', data);
                // Broadcast
                socket.broadcast.emit('serverMessage', data);
            }
        });
    });
};
