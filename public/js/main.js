// Document ready
$(document).ready(function() {
    var chatbox = $('#chatbox');
    chatbox.focus();
    chatbox.attr('autocomplete', 'off');
    chatbox.keydown(function() {
        if(window.event.keyCode === 38) {
            var lastMessage = dom.getLastMessage();
            chatbox.val(lastMessage);
        }
    });
});

// Commands
$('.list-group-item').click(function(event) {
    var val = $(event.target).find('.cmd').html(),
        chatbox = $('#chatbox');
    chatbox.val(val);
    chatbox.focus();
});

// Handle Send
function handleSend() {
    var chatbox = $('#chatbox'),
        message = chatbox.val();
    dom.setLastMessage(message);
    if(message) {
        chatbox.val('');
        client.send(message);
    }
}

// ######### Show messages #########
(function() {
    var body = $('.window-body'),
        alertTypes = {
            normal  : '<div class="alert alert-warning well-sm"></div>',
            red     : '<div class="alert alert-danger well-sm"></div>',
            green   : '<div class="alert alert-success well-sm"></div>'
        },
        chatTypes = {
            me      : '<div class="msg"><span class="bubble bubble-right"></span><div class="clearfix"></div></div>',
            other   : '<div class="msg"><span class="bubble bubble-left"></span><div class="clearfix"></div></div>'
        },
        lastMessage = '';

    // `dom` Namespace
    window.dom = {};

    window.dom.setLastMessage = function(msg) {
        lastMessage = msg;
    };

    window.dom.getLastMessage = function() {
        return lastMessage;
    };

    window.dom.showAlert = function(message, type) {
        var div = $(alertTypes[type]).html(message);
        body.append(div);
        body.animate({scrollTop: body[0].scrollHeight}, 'slow'); // Scroll to bottom
    }

    window.dom.showChat = function(message, type) {
        var div = $(chatTypes[type]);
        div.find('.bubble').html(message);
        body.append(div);
        body.animate({scrollTop: body[0].scrollHeight}, 'slow'); // Scroll to bottom
    }

    window.dom.disconnected = function() {
        var chatbox = $('#chatbox');
        msg = 'Disconnected - Refresh to restart';
        chatbox.val(msg);
        chatbox.prop('disabled', true);
        alert(msg);
    }
})();
