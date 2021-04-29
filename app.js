var createError = require('http-errors');
var express = require('express');
const sessionController = require('./controllers/session.controller');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var apiRouter = require('./routes/api');
var authRouter = require('./routes/auth');
var clientRouter = require('./routes/client');
var toolchainRouter = require('./routes/toolchain');
var cors = require('cors')
var passport = require('passport');
var session = require('express-session');
var app = express();
app.use(session({ 
  secret: 'v43qldow3j',
  cookieName: 'sessionName',
  resave: false,
  saveUninitialized: true,
  httpOnly: true,  // dont let browser javascript access cookie ever
  secure: true, // only use cookie over https
  ephemeral: true // delete this cookie while browser close  
}));
// passport settings
app.use(passport.initialize());
app.use(passport.session());

var fileUpload= require('express-fileupload');
app.use(fileUpload())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// cors
var whitelist = global_config["cors"]
var corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);
app.use('/auth', authRouter);
app.use('/toolchain', toolchainRouter);

app.use(global_config.client_api_settings.base, clientRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

