const express = require('express');

/* Database */

const DB = require('./db');
const config = require('./config');


// To process the json data send from the front end we need body parser
const bodyParser = require('body-parser');
// To confirm authenticated user we will generate  a token and store it.
// So we need a jsonwebtoken generator
const jwt = require('jsonwebtoken');

/* 
	Since we are dealing with password,cannot store it directly ,
	need to hash and encrypt. So we require a hashing library
 */
const bcrypt = require('bcrypt');
/* When do the sqlitedb file is */
const db = new DB('sqlitedb') 
const app = express();
const router = express.Router();

router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

// CORS middleware
/* What's need of the following code */
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}

app.use(allowCrossDomain);


router.post('/register', ( req, res) => { 

	db.insert([
		req.body.name,
		req.body.email,
		bcrypt.hashSync(req.body.password,8)

	], ( err) => {

		if(err) return res.status(500).send("There was a problem registering the user");
		db.selectByEmail(req.body.email, ( err, user) => { 
			if (err) return res.status(500).send("There was a problem getting user")
            let token = jwt.sign({ id: user.id }, config.secret, {expiresIn: 86400 });// expires in 24 hours
        	res.status(200).send({auth:true,token:token,user:user});
		 })
	});
});

router.post('/register-admin', function(req, res) {
    db.insertAdmin([
        req.body.name,
        req.body.email,
        bcrypt.hashSync(req.body.password, 8),
        1
    ],
    function (err) {
        if (err) return res.status(500).send("There was a problem registering the user.")
        db.selectByEmail(req.body.email, (err,user) => {
            if (err) return res.status(500).send("There was a problem getting user")
            let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).send({ auth: true, token: token, user: user });
        }); 
    }); 
});

router.post('/login', ( req, res) => {
	db.selectByEmail(req.body.email, (err, user) => { 
		if(err) res.status(500).send("Something went wrong while  fetching the user");
		if(!user) res.status(404).send("No user found");
        if(!bcrypt.compare(user.user_pass,req.body.password)) res.status(404).send("Username or password is wrong");
		let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 // expires in 24 hours
            });
        res.status(200).send({ auth: true, token: token, user: user });

	});
});
router.get('/user', (req, res) => { 
    console.log("req",req);
    console.log("req.query",req.query);

 })

app.use(router);
/* What is process ? */
let port = process.env.PORT || 3000;
let server = app.listen(port, ( req, res) => {  
	console.log('Express server listening on port ' + port);
})