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


//database connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://user1:a12345@ds163330.mlab.com:63330/project6');

//Open the conenction
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("worked");
});

let quartbackId = 0;

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

//after login,
app.get('/home', function(req,res){

	db.collection('quarterbacks').find().toArray(function(err, results) {

		//print out what is in the database
		console.log(results);
		res.render('home', {quarterbacks: results});
	});
	
});


//display add quartback layout 
app.get('/addquarterback', function(req, res){
	res.render('addquarterback');
});

//add quartback to the database
app.post('/addquarterback', function(req, res){
	
	let name = req.body.firstname + " " + req.body.lastname;
	let _id = Math.floor((Math.random() * 1000000000) + 1);
	console.log(_id);
	let newQuarterback = new quarterback({_id: _id, name: name, age: req.body.age, hometown: req.body.hometown, school: req.body.school});

	newQuarterback.save().then(function(saved){
		if(saved)
		{
			res.redirect('/home');
		}
	
	});

	

});

//after the user click view button
app.get('/detail/:_id', function(req,res){

	console.log(req.params._id);
	quartbackId = req.params._id;
	
	quarterback.find({_id: req.params._id}).then(function(foundUser){
	
	 res.render('detail', {userinfo:foundUser[0]});

	});

});


//add game
app.get('/addgame/:_id', function(req, res){

	console.log("add game for the user");
	console.log(req.params._id);

	res.render('addgame');
});

//add game
app.post('/addgame/:_id', function(req, res){

	console.log("add game for the user");
	console.log(req.params._id);

	let gameId = Math.floor((Math.random() * 1000000000) + 1000000000);

	let gameInfo = {
				gameId: gameId,
				opponent: req.body.opponent,
				location: req.body.location,
				date: req.body.date,
				completions: req.body.completions,
				attempts: req.body.attempts,
				yards: req.body.yards,
				touchdown: req.body.touchdowns,
				intetceptions: req.body.interceptions,
	};


	db.collection('quarterbacks').update({_id: req.params._id},{$push: {game: gameInfo}}, function(err, records){
		if (err) throw err;

		console.log(records);
		res.redirect('/home');
	});
	

});

//show game
app.get('/editgame/:gameId', function(req, res){


	console.log(req.params.gameId);

	console.log("The id is " + quartbackId);
	
	db.collection('quarterbacks').findOne({_id:quartbackId}, function(err, user){
		
		//console.log(user.game);
		
		for(let i = 0; i< user.game.length; i++)
		{
			if(req.params.gameId == user.game[i].gameId)
			{
				res.render('editgame', {'game': user.game[i]});
				break;
			}
		}

	});
	
});

//edit and update the game
app.post('/editgame/:gameId', function(req, res) {
			
	console.log(req.params.gameId);
	console.log(quartbackId);

	db.collection('quarterbacks').findOne({_id:quartbackId}, function(err, user){
		
		let newQuarterback = new quarterback({
			_id: user._id,
			name: user.name,
			age: user.age,
			hometown: user.hometown,
			school: user.school,
			game: user.game

		});

		console.log(newQuarterback);

		for(let i = 0; i< newQuarterback.game.length; i++)
		{
			if(req.params.gameId == newQuarterback.game[i].gameId)
			{
				newQuarterback.game[i].opponent = req.body.opponent;
				newQuarterback.game[i].location =  req.body.location;
				newQuarterback.game[i].date = req.body.date;
				newQuarterback.game[i].completions = req.body.completions;
				newQuarterback.game[i].attempts =  req.body.attempts;
				newQuarterback.game[i].yards =  req.body.yards;
				newQuarterback.game[i].touchdown = req.body.touchdowns;
				newQuarterback.game[i].intetceptions = req.body.intetceptions;
				break;
			}
		}
		
		db.collection('quarterbacks').deleteOne({_id:quartbackId}).then(function(err, res){

			console.log(newQuarterback);
		
			newQuarterback.save().then(function(err, res){

			if(err) return console.log(err);
			console.log(res);
			res.redirect('/home');

			});
		});
		
		
	});
	
	/*
	db.collection('quarterbacks').update({_id: quartbackId, 'game.gameId': req.params.gameId},{$set:{game: info}},(err, res) => {

		if(err) return console.error(err);

		console.log(res);
		console.log("Inserted Successfully");

	});
	*/
			
			
		
	
});


//show quartback info
app.get('/update/:_id', function(req, res){

	console.log(req.params._id);
	quarterback.findOne({_id: req.params._id}).exec(function(err, userinfo){
		if(err) throw err;
		//else
		console.log(userinfo);
		res.render('update',{userinfo: userinfo});
	});

});

//the user click the update button, the quartback info will get update
app.post('/update/:_id', function(req, res){
	
	console.log(req.params._id);

	let info = {$set:{
		name: req.body.name,
		age: req.body.age,
		hometown: req.body.hometown,
		school: req.body.school
		}};

	db.collection('quarterbacks').findOneAndUpdate({_id: req.params._id},info, function(err, update){

		console.log("Update successfully");
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
