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
        // HERE
    }
}
