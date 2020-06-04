const http = require('http');
const port = process.env.PORT || 3300;
const path = require ('path');
const mongoose     = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const express      = require('express');
const fs = require ('fs');
const userRouter    = require('./routes/userRoutes');
const MongoStore   = require('connect-mongo')(session);

// Obtain the Express instance
const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require ('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, {useUnifiedTopology: true, useNewUrlParser: true})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

//HTML Engine
app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'ejs')

// BodyParser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Express session
app.use(
  session({
    secret: 'secret',
    expires: new Date(Date.now() + 3600000),
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/public/html/');

//Routes
app.use('/users', userRouter);
app.use('/', require('./routes/index.js'));

app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
})

app.listen(port, console.log(`Node Server is running on port : ${port}`));

