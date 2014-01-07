// Document ready
$(document).ready(function() {
    $('#chatbox').focus();
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
    if(message) {
        chatbox.val('');
        send(message);
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
        };

    window.showAlert = function(message, type) {
        var div = $(alertTypes[type]).html(message);
        body.append(div);
    }

    window.showChat = function(message, type) {
        var div = $(chatTypes[type]);
        div.find('.bubble').html(message);
        body.append(div);
    }
})();
