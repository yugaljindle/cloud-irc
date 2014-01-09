// Imports
var sanitize = require('validator').sanitize,
    __ = require('underscore')._;

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

    // JS helper functions
    String.prototype.startsWith = function(needle) {
        return(this.indexOf(needle) == 0);
    };

    // Shared state
    var users = [],
        validCommands,
        rooms = [
            'python_room',
            'javascript_room',
            'design_room',
            'wash_room'
        ];

    // Respond to client
    function respond(client, message, type) {
        client.socket.emit('serverMessage', {
            message : message,
            type    : type
        });
    }
    // Respond to room except client himself
    function respondToRoom(client, message, type) {
        client.socket.broadcast.to(client.room).emit('serverMessage', {
            message : message,
            type    : type
        });
    }
    // Notify room including himself
    function notifyRoom(client, message, type) {
        io.sockets.in(client.room).emit('serverMessage', {
            message : message,
            type    : type
        });
    }

    // Validate username
    function checkUsername(client, username) {
        var msg,
            hasSpace = (username.indexOf(' ') !== -1);
        if(hasSpace) {
            msg = '`'+ username +'` : Username can-not have spaces';
            respond(client, msg, 'alert-red');
            respond(client, 'Choose a username ?', 'alert-green');
            return false;
        } else if(username.startsWith('/')) {
            msg = '`'+ username +'` : Username can-not start with `/`'; 
            respond(client, msg, 'alert-red');
            respond(client, 'Choose a username ?', 'alert-green');
            return false;
        } else if(__.indexOf(users, username) !== -1) {
            msg = '`'+ username +'` : Username is already taken'; 
            respond(client, msg, 'alert-red');
            respond(client, 'Choose a username ?', 'alert-green');
            return false;
        }
        return true;
    }

    // Valid Commands
    function cmdRooms(client, cmd) {
        if(cmd === '/rooms') {
            var roomsStr = rooms.join('<br />');
            roomsStr = 'Rooms :<br />' + roomsStr;
            respond(client, roomsStr, 'alert-normal');
            return true;
        }
        return false;
    }
    function cmdJoin(client, cmd) {
        var roomName = cmd.split(' ');
        roomName.splice(0, 1);
        roomName = roomName.join(' ');
        if(__.indexOf(rooms, roomName) === -1) {
            msg = 'Room `'+ roomName +'` does-not exists !';
            respond(client, msg, 'alert-red');
            respond(client, 'Checkout chat rooms with `/rooms`', 'alert-normal');
            return true;
        } else {
            client.room = roomName;
            client.socket.join(roomName);
            respond(client, ' ===== Joined `'+ client.room +'` ===== ', 'alert-green');
            respondToRoom(client, 'User @'+ client.username +' has joined in', 'alert-normal');
            return true;
        }
        return false;
    }
    function cmdLeave(client, cmd) {
        if(cmd === '/leave') {
            if(client.room) {
                // If still connected
                if(client.socket.status) {
                    respond(client, ' ===== Exited `'+ client.room +'` room ===== ', 'alert-red');
                    client.socket.leave(client.room);
                }
                notifyRoom(client, 'User @'+ client.username +' has left the room', 'alert-normal');
                client.room = undefined; // Clear room once everyone notified
            } else {
                // Havn't yet joined any-room
                if(client.socket.status) {
                    respond(client, "You havn't joined any room yet !", 'alert-red');
                }
            }
            return true;
        }
        return false;
    }
    function cmdQuit(client, cmd) {
        if(cmd === '/quit') {
            var index = users.indexOf(client.username);
            users.splice(index, 1);
            if(client.room) {
                cmdLeave(client, '/leave');
            }
            // If still connected
            if(client.socket.status) {
                respond(client, ' ===== Bye @'+ client.username +' - Quitting chat ===== ', 'alert-red');
                client.socket.disconnect();
            }
            return true;
        }
        return false;
    }
    validCommands = {
        '/rooms'    : cmdRooms,
        '/join'     : cmdJoin,
        '/leave'    : cmdLeave,
        '/quit'     : cmdQuit
    };
    // Check for command
    function command(client, msg) {
        var i, len, valid = false;
        if(msg.startsWith('/')) {
            var cmds = __.keys(validCommands);
            for(i=0, len=cmds.length; i<len; i++) {
                var cmd = cmds[i];
                if(msg.startsWith(cmd)) {
                    valid = validCommands[cmd](client, msg);
                }
            }
            if(!valid) {
                respond(client, '`'+ msg +'` : Invalid command !', 'alert-red');
            }
            return true;
        }
        return false;
    }

    // Connection
    io.sockets.on('connection', function(socket) {
        var client = {
            username    : undefined,
            room        : undefined,
            socket      : socket
        };
        // Add connection status
        client.socket.status = true;
        // Welcome message
        respond(client, 'Welcome to cloud-irc !', 'alert-normal');
        respond(client, 'Choose a username ?', 'alert-green');
        // Receive from client
        client.socket.on('clientMessage', function(data) {
            var msg = sanitize(data.message).escape();
            // Get him a username
            if(!client.username && checkUsername(client, msg)) {
                client.username = msg; 
                users.push(client.username);
                respond(client, 'Username `'+ client.username +'` granted !', 'alert-green');
                respond(client, 'Checkout chat rooms with `/rooms`', 'alert-normal');
                return;
            }
            // Get him a room
            if(client.username && !command(client, msg) && !client.room) {
                respond(client, 'You must `/join` a room to chat.', 'alert-red');
                respond(client, 'Checkout chat rooms with `/rooms`', 'alert-normal');
                return;
            }
            // Have username & inside a room
            if(client.username && client.room && !command(client, msg)) {
                // Acknowledge user
                respond(client, data.message, 'chat-me');
                // Broadcast to the room
                data.message = '@' + client.username + ' : ' + data.message;
                respondToRoom(client, data.message, 'chat-other');
            }
        });
        // Disconnect
        client.socket.on('disconnect', function() {
            client.socket.status = false;
            cmdQuit(client, '/quit'); // Fire /quit
        });
    });
};
