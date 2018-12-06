// Import NPM packages
const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const session = require('express-session');

const saltRounds = 10;

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

//declear array
let homeArray = [];

//database connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://user1:a12345@ds163330.mlab.com:63330/project6');

//Open the conenction
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("worked");
});

//user.js
let user = require('./modules/user');
//quartback.js
let quarterback = require('./modules/quarterbacks');

// Login screen should display the form
app.get('/', function(req, res) {
	// Render the login screen.  Any problem passed into the query string will be available to the template.
	res.render("login", {problem: req.query.problem});
});

//Authericate user
app.post('/', function(req, res){

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

//after login
app.get('/home', function(req,res){

	db.collection('quarterbacks').find().toArray(function(err, results) {

		//print out what is in the database
		console.log(results);
		res.render('home', {info: results});

		});
});


//display table
app.get('/add', function(req, res){
	res.render('add');
});

//add table
app.post('/add', function(req, res){
	
	let name = req.body.firstname + " " + req.body.lastname;
	let newQuarterback = new quarterback({name: name, age: req.body.age, hometown: req.body.hometown, school: req.body.school});

	newQuarterback.save().then(function(saved){
		if(saved)
		{
			res.redirect('/home');
		}
	
	});

	

});

// Login screen should display the form
app.get('/signUp', function(req, res) {
	res.render("signUp");
});

//save user info to database
app.post('/signUp', function(req,res){

	//print what the user ented
	bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
		
		console.log(hash);

		let newUser = new user({username: req.body.username, password: hash});

		newUser.save().then(function(saveUser){
			//console.log(saveUser.username);
			res.redirect('/home');
		
		});

	  });

});


//after the user click view button
app.get('/detail/:name', function(req,res){

	quarterback.find({name: req.params.name}).then(function(foundUser){

	
	/*
	
	let gameInfo = [];
	gameInfo.push({
		name: req.params.name
	});
	gameInfo.push(foundUser[0].game);

	console.log(gameInfo);
	*/

	 res.render('detail', {userinfo:foundUser[0]});

	});

});


//update table
app.get('/game/:name', function(req, res){

	console.log("add game for the user");
	console.log(req.params.name);

	res.render('add_edit_game');
});

//add game
app.post('/game/:name', function(req, res){

	console.log("add game for the user");
	console.log(req.params.name);

	let gameInfo = {
				opponent: req.body.opponent,
				location: req.body.location,
				date: req.body.date,
				completions: req.body.completions,
				attempts: req.body.attempts,
				yards: req.body.yards,
				touchdown: req.body.touchdowns,
				intetceptions: req.body.interceptions,
	};

	db.collection('quarterbacks').update({name: req.params.name},{$push: {game: gameInfo}}, function(err, records){
		if (err) throw err;
		console.log("1 document updated");
		res.redirect('/game/:name');
		db.close();
	});

});

//show quartback info
app.get('/update/:name', function(req, res){

	quarterback.findOne({name: req.params.name}).exec(function(err, userinfo){

		console.log(userinfo);
		res.render('update',{userinfo: userinfo});
	});

});

//the user click the update button, the quartback info will get update
app.post('/update/:name', function(req, res){
	
	console.log("Test");
	console.log(req.params.name);

	let info = {
		name: req.body.name,
		age: req.body.age,
		hometown: req.body.hometown,
		school: req.body.school
		};

	console.log(info);

	db.collection('quarterbacks').update({name: req.params.name},info, function(err, update){

		res.redirect('/home');
	});


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
