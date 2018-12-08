// Import NPM packages
const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const session = require('express-session');
const saltRounds = 10;
const credentials = require('./credentials.js');

// This is our app
let app = express();

//set up cookie psrser
app.use(require('cookie-parser')(credentials.cookieSecrets));

//set up session management
app.use(require("express-session")({
	resave: false,
	saveUnitialized: false,
	secret: credentials.cookieSecrets
}));

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
//check if user already login
let userlogin = false;

//user.js
let user = require('./modules/user');
//quartback.js
let quarterback = require('./modules/quarterbacks');

// Login screen should display the form
app.get('/', function(req, res) {

	// Render the login screen.  Any problem passed into the query string will be available to the template.

	//check if the user already exist, if not direct to login
	if(req.session && req.session.user && req.session.user.username){

	//direct the user home page
	res.redirect('/home');
		
	}else{
		//if is a new user, direct to login
		res.redirect('/login');
	}
});

//login page
app.get('/login', function(req, res){
	res.render('login');
});

//Authericate user
app.post('/login', function(req, res){

	//find username in the database
	user.findOne({username: req.body.username}).exec(function(err, loginuser){
		
		//if user doesn't exist, redirect to login 
		if(err){
			res.redirect('/');
			console.log(err);
		}//if user exist 
		else if(loginuser)
		{
			//compare user inputs with database password
			bcrypt.compare(req.body.password,loginuser.password, function(err, result){
			
				if(result === true)
				{
					console.log("User login successfully");

					req.session.user = {
						username: req.body.username,
						lesson: 0
					}

					userlogin = true;
					res.redirect('/home');

				}else{

					res.redirect('/');
				}
			});
		}

	});

});

// render signUp screen
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
			//redirect the user to login page
			res.redirect('/');
		
		});

	  });

});

//home page, after user login
app.get('/home', function(req,res){

	//check if user already login first, if not, redirect to login
	if(userlogin)
	{
		db.collection('quarterbacks').find().toArray(function(err, results) {

			//print out what is in the database
			console.log(results);

			//declat array to pass to handlebars
			let crArray = [];

			//loop throught the database and calculate user comp ratio
			for(let i = 0; i < results.length; i++)
			{
				let com = 0;
				let att = 0;
				let cr = 0;

				for(let j = 0; j < results[i].game.length; j++)
				{
					com += Number(results[i].game[j].completions);
					att += Number(results[i].game[j].attempts);
					
				}

				//if both number equal to 0, push 0 to the array
				if(com == 0 && att == 0)
				{
					cr = 0;

				}else{
					//calculate percentage
					cr = Math.ceil(com / att * 100);
					console.log(cr);
				}

				//push info to array
				crArray.push({
					name: results[i].name,
					school: results[i].school,
					cr: cr,
					_id:results[i]._id
				});
			}

			//render selcted quarter detail page
			res.render('home', {quarterbacks: crArray});

		});
	}else{
		res.redirect('/');
	}
	
});

//display add quartback layout 
app.get('/addquarterback', function(req, res){
	//check if user already login first, if not, redirect to login
	if(userlogin)
	{
		res.render('addquarterback')
	}else{
		res.redirect('/');
	}
});

//add quartback to the database
app.post('/addquarterback', function(req, res){

	//check if user already login first, if not, redirect to login
	if(userlogin)
	{
			
		//send user first name and last name as one object
		let name = req.body.firstname + " " + req.body.lastname;
		
		//random generate id for user
		let _id = Math.floor((Math.random() * 1000000000) + 1);

		//create new quarterbacks
		let newQuarterback = new quarterback({_id: _id, name: name, age: req.body.age, hometown: req.body.hometown, school: req.body.school});

		//save new quarterback to the databse and resirect to home
		newQuarterback.save().then(function(saved){
			if(saved)
			{
				res.redirect('/home');
			}
		
		});
	}else{
		res.redirect('/');
	}

	

});

//after the user click view button
app.get('/detail/:_id', function(req,res){

	//check if user already login first, if not, redirect to login
	if(userlogin)
	{
		//assign quartback id
		quartbackId = req.params._id;

		//create array to push all sum 
		let newRecord = [];

		//add all number
		let completions = 0;
		let attempts = 0;
		let cr = 0;
		let yards = 0;
		let tds = 0;
		let interce = 0;
		
		quarterback.find({_id: req.params._id}).then(function(foundUser){

			//calculate sum for game object 
			for(let i = 0; i< foundUser[0].game.length; i++)
			{

				completions += Number(foundUser[0].game[i].completions);
				attempts += Number(foundUser[0].game[i].attempts);
				yards += Number(foundUser[0].game[i].yards);
				tds += Number(foundUser[0].game[i].touchdown);
				interce += Number(foundUser[0].game[i].intetceptions);

			}

			//if completeions and attems equal to 0, cr equal to 0
			if(completions == 0 && attempts == 0)
			{
				cr = 0;
				
			}else{
				//calculate cr
				cr = Math.ceil(completions / attempts * 100);
			}

			//push sum to array
			newRecord.push({
				completions: completions,
				attempts: attempts,
				cr: cr,
				yards: yards,
				touchdown: tds,
				interce: interce
			});

			//console.log(newRecord);

			//render the detail page and send in new sum array
			res.render('detail', {record: newRecord[0], userinfo:foundUser[0]});

		});
	}else{
		res.redirect('/');
	}

});

//render addgame page
app.get('/addgame/:_id', function(req, res){

	//check if user already login first, if not, redirect to login
	if(userlogin)
	{
		//console.log("add game for the user");
		//console.log(req.params._id);
		res.render('addgame');
	}else{
		res.redirect('/');
	}
});

//add game
app.post('/addgame/:_id', function(req, res){

	//check if user already login first, if not, redirect to login
	if(userlogin)
	{
		//console.log("add game for the user");
		//console.log(req.params._id);
		//assign game id
		let gameId = Math.floor((Math.random() * 1000000000) + 1000000000);

		//create new game object
		let gameInfo = {
					_id: gameId,
					opponent: req.body.opponent,
					location: req.body.location,
					date: req.body.date,
					completions: req.body.completions,
					attempts: req.body.attempts,
					yards: req.body.yards,
					touchdown: req.body.touchdowns,
					intetceptions: req.body.interceptions,
		};

		//find the id according to quartedback id and push game to that quarterback id
		db.collection('quarterbacks').updateOne({_id: req.params._id},{$push: {game: gameInfo}}, function(err, records){
			if (err) throw err;

			//console.log(records);
			//redire user to home page
			res.redirect('/home');
		
		});
	}else{
		res.redirect('/');
	}

});

//show game
app.get('/editgame/:_id', function(req, res){

	//check if user already login first, if not, redirect to login
	if(userlogin)
	{
		//console.log(req.params._id);
		//console.log("The id is " + quartbackId);
		//find user accoring to quarterback id
		db.collection('quarterbacks').findOne({_id:quartbackId}, function(err, user){
			
			//console.log(user.game);
			//loop through info and display the correct one
			for(let i = 0; i< user.game.length; i++)
			{
				if(req.params._id == user.game[i]._id)
				{
					res.render('editgame', {'game': user.game[i]});
					break;
				}
			}

		});
	}else{
		res.redirect('/');
	}
	
});

//edit and update the game
app.post('/editgame/:_id', function(req, res) {
	
	//check if user already login first, if not, redirect to login
	if(userlogin)
	{
		//console.log(req.params._id);
		//console.log(quartbackId);
		//assign button and button value
		let button = req.body.button;
		//console.log(button);
		//if delete button is pressed
		if(button == 'delete')
		{
			//console.log('delete button pressed');
			//delete this game from the databse
			db.collection('quarterbacks').findOne({_id:quartbackId}, function(err, user){

				let newQuarterback = new quarterback({
					_id: user._id,
					name: user.name,
					age: user.age,
					hometown: user.hometown,
					school: user.school,
					game: user.game

				});

				for(let i = 0; i < newQuarterback.game.length; i++)
				{
					if(req.params._id == newQuarterback.game[i]._id)
					{
						newQuarterback.game.splice(i,1);
						break;
					}
					
				}
				//save new game 
				db.collection('quarterbacks').deleteOne({_id: quartbackId}).then(function(err, result){

					console.log(newQuarterback);
					newQuarterback.save().then(function(){
						res.redirect('/home');
					});
				});
			});

		}else if(button == 'update'){

			//console.log('Update button pressed');
			//Update new game
			db.collection('quarterbacks').findOne({_id:quartbackId}, function(err, user){
				
				let newQuarterback = new quarterback({
					_id: user._id,
					name: user.name,
					age: user.age,
					hometown: user.hometown,
					school: user.school,
					game: user.game

				});

			//console.log(newQuarterback);

			for(let i = 0; i< newQuarterback.game.length; i++)
			{
				if(req.params._id == newQuarterback.game[i]._id)
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
			//save game to the databse and redirect to home 
			db.collection('quarterbacks').deleteOne({_id: quartbackId}).then(function(err, result){

				//console.log(newQuarterback);
				
				newQuarterback.save().then(function(){
					res.redirect('/home');
				});
			});
				
			});
		}
	}else{
		res.redirect('/');
	}

		
});

//show quartback info
app.get('/update/:_id', function(req, res){

	//check if user already login first, if not, redirect to login
	if(userlogin)
	{
		//console.log(req.params._id);
		quarterback.findOne({_id: req.params._id}).exec(function(err, userinfo){
			if(err) throw err;
			//console.log(userinfo);
			res.render('update',{userinfo: userinfo});
		});
	}else{
		res.redirect('/');
	}

});

//the user click the update button, the quartback info will get update
app.post('/update/:_id', function(req, res){
	
	//check if user already login first, if not, redirect to login
	if(userlogin)
	{
		//console.log(req.params._id);
		//set new info for quarterback
		let info = {$set:{
			name: req.body.name,
			age: req.body.age,
			hometown: req.body.hometown,
			school: req.body.school
			}};

		//assign button and button value
		let button = req.body.button;
		console.log(button);

		//if delete button is pressed, delete quarterback 
		if(button == 'delete')
		{
			console.log('delete button pressed');
			db.collection('quarterbacks').deleteOne({_id: req.params._id}).then(function(){

				res.redirect('/home');

			});

		//if update button is pressed, update quarterback info
		}else if(button == 'update')
		{
			//console.log('submit button pressed');

			db.collection('quarterbacks').findOneAndUpdate({_id: req.params._id},info, function(err, update){

				console.log("Update successfully");
				res.redirect('/home');
				
			});
		}
	}else{
		res.redirect('/');
	}
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
