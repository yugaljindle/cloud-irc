/**
 * Module dependencies.
 */
var http     = require('http'),
    path     = require('path'),
    express  = require('express'),
    engines  = require('consolidate'),
    favicons = require('connect-favicons');

var app = express();


/**
 * General configs
 */
app.set('port', process.env.PORT || 3000);
app.use(express.logger());
// Directory structure
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(path.join(__dirname, 'public')));
// View Config
app.set("view options", { layout: false });
app.engine('html', engines.mustache);
app.set('view engine', 'html');

/**
 * Env configs
 */
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Icons & Routes 
app.use(favicons(__dirname + '/public/img/icons'));
app.get('/', function(req, res){
  res.render('index.html');
});

// Server
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// ####################### Socket.io #######################
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

io.sockets.on('connection', function(socket) {
    // Test
    io.sockets.emit('serverMessage', {
        message : "This is a normal message !",
        type    : "alert-normal"
    });
    io.sockets.emit('serverMessage', {
        message : "This is a red message !",
        type    : "alert-red"
    });
    io.sockets.emit('serverMessage', {
        message : "This is a green message !",
        type    : "alert-green"
    });
    io.sockets.emit('serverMessage', {
        message : "This is your chat message !",
        type    : "chat-me"
    });
    io.sockets.emit('serverMessage', {
        message : "This is other's chat message !",
        type    : "chat-other"
    });
    // Receive from client
    socket.on('clientMessage', function(data) {
        io.sockets.emit('serverMessage', data);
    });
});
