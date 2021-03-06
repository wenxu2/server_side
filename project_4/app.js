const express = require('express');

let app = express();
// Set up body parser for JSON submissions
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static('views/images')); 
app.use(bodyParser.urlencoded({extended: true}));

// set up handlebars view engine
let handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Data storage
let instruments = require('./data/instruments.json');
let instructors = require('./data/instructors.json');
let user = require('./data/users.json');

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

//Home page
app.get('/', function(req, res) {
	res.render('home',{'instruments' :instruments});
});

//Check appointment 
app.get('/lessons/list',function(req, res) {
	
	//go to list.handlerbars
	res.render('list', {'appointment': appointment});
});

// Search instruments
app.get('/lessons/:id', function(req, res) {
	
	// Loop over all instructors, only retaining those who match
	let theseInstructors = instructors.filter((instructor) => {
		// Look at this instructor's instruments to see if they teach the instrument
		return instructor.instruments.find((element) => {
			return element.code === req.params.id;
		});
	});

	//display the instructors of select instruments
	res.render('instructors', {'instructors': theseInstructors});
	
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
