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

    // Respond
    function respond(socket, message, type) {
        socket.emit('serverMessage', {
            message : message,
            type    : type
        });
    }
    // Respond to room
    function respondToRoom(socket, room, message, type) {
        socket.broadcast.to(room).emit('serverMessage', {
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
            respond(socket, 'Choose a username ?', 'alert-green');
            return false;
        } else if(username.startsWith('/')) {
            msg = '`'+ username +'` : Username can-not start with `/`'; 
            respond(socket, msg, 'alert-red');
            respond(socket, 'Choose a username ?', 'alert-green');
            return false;
        } else if(__.indexOf(users, username) !== -1) {
            msg = '`'+ username +'` : Username is already taken'; 
            respond(socket, msg, 'alert-red');
            respond(socket, 'Choose a username ?', 'alert-green');
            return false;
        }
        return true;
    }

    // Valid Commands
    function cmdRooms(socket, username, room, cmd) {
        if(cmd === '/rooms') {
            var roomsStr = rooms.join('<br />');
            roomsStr = 'Rooms :<br />' + roomsStr;
            respond(socket, roomsStr, 'alert-normal');
            return true;
        }
        return false;
    }
    function cmdJoin(socket, username, room, cmd) {
        var roomName = cmd.split(' ');
        roomName.splice(0, 1);
        roomName = roomName.join(' ');
        if(__.indexOf(rooms, roomName) === -1) {
            msg = 'Room `'+ roomName +'` does-not exists !';
            respond(socket, msg, 'alert-red');
            respond(socket, 'Checkout chat rooms with `/rooms`', 'alert-normal');
            return true;
        } else {
            room = roomName;
            socket.join(roomName);
            respond(socket, ' ===== Joined `'+ roomName +'` ===== ', 'alert-green');
            return true;
        }
        return false;
    }
    function cmdLeave(socket, username, room, cmd) {
        if(cmd === '/leave') {
            respond(socket, ' ===== Exited room : '+ room +' ===== ', 'alert-red');
            socket.leave(room);
            room = undefined;
            respondToRoom(socket, room, 'User @'+ username +' has left the room', 'alert-normal');
            return true;
        }
        return false;
    }
    function cmdQuit(socket, username, room, cmd) {
        if(cmd === '/quit') {
            var index = users.indexOf(username);
            console.log(users);
            users.splice(index, 1);
            console.log(users);
            respond(socket, ' ===== Bye @'+ username +' - Quitting chat ===== ', 'alert-red');
            respondToRoom(socket, room, 'User @'+ username +' has left the room', 'alert-normal');
            socket.disconnect();
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
    function command(socket, username, room, msg) {
        var i, len, valid = false;
        if(msg.startsWith('/')) {
            var validCmds = __.keys(validCommands);
            for(i=0, len=validCmds.length; i<len; i++) {
                var cmd = validCmds[i];
                if(msg.startsWith(cmd)) {
                    valid = validCommands[cmd](socket, username, room, msg);
                }
            }
            if(!valid) {
                respond(socket, '`'+ msg +'` : Invalid command !', 'alert-red');
            }
            return true;
        }
        return false;
    }

    // Connection
    io.sockets.on('connection', function(socket) {
        // Welcome message
        respond(socket, 'Welcome to cloud-irc !', 'alert-normal');
        respond(socket, 'Choose a username ?', 'alert-green');
        var username, room;
        // Receive from client
        socket.on('clientMessage', function(data) {
            var msg = sanitize(data.message).escape();
            // Get him a username
            if(!username && checkUsername(socket, msg)) {
                username = msg; 
                users.push(username);
                respond(socket, 'Username `'+ msg +'` granted !', 'alert-green');
                respond(socket, 'Checkout chat rooms with `/rooms`', 'alert-normal');
                return;
            }
            // Get him a room
            if(username && !command(socket, username, room, msg) && !room) {
                respond(socket, 'You must `/join` a room to chat.', 'alert-red');
                respond(socket, 'Checkout chat rooms with `/rooms`', 'alert-normal');
                return;
            }
            // Have username & inside a room
            if(username && room && !command(socket, username, room, msg)) {
                // Acknowledge user
                respond(socket, data.message, 'chat-me');
                // Broadcast to the room
                data.message = '@' + username + ' : ' + data.message;
                respondToRoom(socket, room, data.message, 'chat-other');
            }
        });
    });
};
