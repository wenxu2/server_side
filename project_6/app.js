// Import NPM packages
const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const session = require('express-session');

// Data structure to track the lessons taken by users
let lessonTracker = {};

// This is our app
let app = express();

// Set up our body parser
app.use( bodyParser.urlencoded( {extended: false} ) );

// set up handlebars view engine
let handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

//database connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://user1:a12345@ds163330.mlab.com:63330/project6');

//Open the conenction
/*let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("worked");
});*/


//mongodb://user1:a12345@ds163330.mlab.com:63330/project6


// Login screen should display the form
app.get('/', function(req, res) {
	// Render the login screen.  Any problem passed into the query string will be available to the template.
	res.render("login", {problem: req.query.problem});
});


//after login
app.get('/table', function(req,res){
	res.render('table');
});


//after the user click view button
app.get('/detail', function(req,res){
	res.render('detail');
});


// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});
