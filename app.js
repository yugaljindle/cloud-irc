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
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
