var express = require('express'), // call express
	app = express(), // define our app using express
	bodyParser = require('body-parser'), // get body-parser
	morgan = require('morgan'), // used to see requests
	mongoose = require('mongoose'), // for working with our database
	port = process.env.PORT || 8080, // set the port for our app
	User = require('./app/models/user'),
	jwt = require('jsonwebtoken');

var superSecret = 'martsdiscoballs';

// connect to our database
mongoose.connect('localhost:27017/db_me');

//APP CONFIGURATION
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req,res,next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \
		Authorization');
	next();
});

// log all requests to the console
app.use(morgan('dev'));

//ROUTES FOR OUR API
// ===========================

// basic route for the home page
app.get('/', function(req,res) {
	res.send('Welcome to the homepage');
});

// get an instance of the express router
var apiRouter = express.Router();

// route for authenticatin users
apiRouter.post('/authenticate', function(req,res){

	// find the user
	// select the name username and password explicitly
	User.findOne({ 
		username: req.body.username }).select('name username password').exec(function(err,user) {
			if (err) throw err;

			// no user with that username was found
			if (!user) {
				res.json({ 
					success: false,
					message: 'Authentication failed. User not found'
				})
			} else if (user) {

				//check if password matches
				var validPassword = user.comparePassword(req.body.password);
				if (!validPassword) {
					res.json({
						success: false,
						messae: 'Authentication failed. Wrong password.'
					});
				} else {

					// if user is found and password is right
					// create a token
					var token = jwt.sign({
						name:user.name,
						username: user.username
					}, superSecret, {
						expiresInMintues: 1440 //expies in 24 hours
					});

					// return the information including token as JSON
					res.json({
						success: true,
						message: 'Enjoy your token',
						token:token
					});
				}
			}

		});
});

// middleware to use for all requests
apiRouter.use(function(req,res,next) {
	//do logging
	console.log('Somebody just came to our app.');

	// we'll add more to the middleware later
	// this is where we will authenticate users

	next();

});

// test route to make sure everything is working
// access at GET 8080/api
apiRouter.get('/', function(req,res) {
	res.json({ message: 'hooray! welcome to my api.'});
});

// more routes for the api will happen here

//REGISTER OUR ROUTES
// all of our routes will be prefixed with /api
app.use('/api', apiRouter);

// ROUTES FOR OUR API
//========================

// route middleware and first oute are here

// on routes that end in /users
// -----------------------------------------------------
apiRouter.route('/users')

	// create a user (access at POST loclhost://8080/api/users)
	.post(function(req,res) {

		//mg test
		console.log('req.body', req.body);
		// create a new instance of the User model
		var user = new User();

		// set the users information (comes from the request)
		user.name = req.body.name;
		user.username = req.body.username;
		user.password = req.body.password; 

		// save the user and check for errors
		user.save(function(err) {
			if (err) {
				// duplicate entry
				if(err.code === 11000)
					return res.json({ success: false, message: 'A user with that username already exists. '});
				else
					return res.send(err);
			}

				res.json({ message: 'User created!' });
		});
	})

	//get all the users (accessed at GET 8080/api/users)
	.get(function(req,res) {
		User.find(function(err,users) {
			if (err) res.send(err);

			// return the users
			res.json(users);
		});
	});

apiRouter.route('/users/:user_id')

	// get the user with that id
	// (accessed at GET 8080/api/users/:user_id)
	.get(function(req,res) {
		User.findById(req.params.user_id, function(err,user) {
			if (err) res.send(err);

			//mg test
			console.log('req.body.name', req.params.user_id);

			// return that user
			res.json(user);
		});
	})

	// update the user with this id
	// accessed at PUT 8080/api/users/:user_id
	.put(function(req,res) {

		// use our user model to find the user we want
		User.findById(req.params.user_id, function(err, user) {

			if(err) res.send(err);

			//mg test
			console.log('req.body.name', req.body.name);

			//update the users info only if its new
			if (req.body.name) user.name = req.body.name;
			if (req.body.username) user.username = req.body.username;
			if (req.body.password) user.password = req.body.password;

			//save the user
			user.save(function(err) {
				if(err) res.send(err);

				// return a message
				res.json({ message: 'User updated.' });
			});
		});
	})

	// delete the user with this id
	// (accessed at DELETE 8080/api/users/:user_id)
	.delete(function(req,res) {
		User.remove({
			_id: req.params.user_id
		}, function(err,user) {
			if (err) return res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});

//START THE SERVER
// =======================
app.listen(port);
console.log('Magic happens on port ' + port);