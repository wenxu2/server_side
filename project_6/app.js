// Import NPM packages
const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const session = require('express-session');

const saltRounds = 10;

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
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("worked");
});

//
let user = require('./modules/user');


// Login screen should display the form
app.get('/', function(req, res) {
	// Render the login screen.  Any problem passed into the query string will be available to the template.
	res.render("login", {problem: req.query.problem});
});

//Authericate user
app.post('/', function(req, res){
	
	//print what the user ented
	//let userLogin = new user({username: req.body.username, password: req.body.password});
	
	user.findOne({username: req.body.username}).exec(function(err, loginuser){

			if(loginuser)
			{
				console.log(loginuser.password);
				console.log(req.body.password);
				
				bcrypt.compare(req.body.password,loginuser.password, function(err, result){
				
					if(result === true)
					{
						console.log("User login successfully");
						res.redirect('/home');
					}
				});
		}

	});

});

//add table
app.get('/add', function(req, res){
	res.render('add');
});

//update table
app.get('/update', function(req, res){
	res.render('update');
});

//update table
app.get('/game', function(req, res){
	res.render('add_edit_game');
});

// Login screen should display the form
app.get('/signUp', function(req, res) {
	res.render("signUp");
});

//save user info to database
app.post('/signUp', function(req,res){

	//print what the user ented
	//console.log(req.body.username);
	//console.log(req.body.password);

	bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
		
		console.log(hash);

		let newUser = new user({username: req.body.username, password: hash});

		newUser.save().then(function(saveUser){
			//console.log(saveUser.username);
		
		});

	  });

});


//after login
app.get('/home', function(req,res){
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
