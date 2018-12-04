const express = require('express');
const bodyParser = require('body-parser');

let app = express();

app.use(bodyParser.urlencoded( {extended: false } ) );

//Mongoose option
const options = {server: {socketOptions: {keepAlive: 1 } } };

// Set up first mongoose connection
let mongoose1 = require('mongoose');
let db1 = mongoose1.createConnection('mongodb://ballotRO:XooRqtLAxe9ZKK@ds143953.mlab.com:43953/project5', options);
let Race = require('./models/race.js')(db1);

// Set up second mongoose connection
let mongoose2 = require('mongoose');
let db2 = mongoose2.createConnection('mongodb://proj5dev:voter123@ds045087.mlab.com:45087/project5-results', options);
let Vote = require('./models/vote.js')(db2);

// Open the connections
db1.on('error', console.error.bind(console, 'connection error:'));
db1.once('open', function() { console.log("db1 connected"); });

db2.on('error', console.error.bind(console, 'connection error:'));
db2.once('open', function() { console.log("db2 connected"); });

// set up handlebars view engine
let handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));


/* Start the route */
app.get('/', function(req, res) {
	res.render('home');
});

// Get the application races and then render the ballot
app.post('/ballot', function(req,res){

	
	//make sure the form contains a district and a voter id
	//Otherwise, redirect the user to the home screen
	if(req.body.district && req.body.voterId){

		Vote.find( { voterId: req.body.voterId }).then(function(found) {
			
			if(found.length > 0) {
				console.log(found);
				res.render("voted");
			} else {
				const districtInt = parseInt(req.body.district);

				Race.find({ $or: [({districts: 0}, {districts: districtInt})]}).then(function(foundRaces){
					
					res.render("ballot", {
						voterId: req.body.voterId,
						district: districtInt,
						races: foundRaces
					});
					console.log(foundRaces);
					
				}).catch(function(err){
					console.log(err);
					res.render('/');//redirect back to home page if a error occur
				});

			}
		});

	}else{
		res.redirect('/');
	}
});

app.post("/vote", function(req, res){
	
	let voted = false;

	//Make sure we have the voterId from the user
	if(req.body.voterId){

		//make a copy of the body, then delete teh voterId and the district from it
		const votes = Object.assign(1,2);
		delete votes.voterId;
		delete votes.district;
		
		Vote.find( { voterId: req.body.voterId }).then(function(found) {
			
			if(found.length > 0) {
				console.log(found);
				res.render("voted");
			}
			else {
				new Vote({
					voterId: req.body.voterId,
					district: req.body.district,
					voes: votes
		
				}).save().then(function(savedVote){
					res.render('home');
				});
			}
		});
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
